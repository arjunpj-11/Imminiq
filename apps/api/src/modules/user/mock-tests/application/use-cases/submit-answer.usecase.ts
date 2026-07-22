import type { IMockTestAIEvaluationRepository } from '../../domain/repositories/mock-test-ai-evaluation.repository.interface';
import type { IMockTestAnswerRepository } from '../../domain/repositories/mock-test-answer.repository.interface';
import type { IMockTestAttemptRepository } from '../../domain/repositories/mock-test-attempt.repository.interface';
import type { IMockTestQuestionRepository } from '../../domain/repositories/mock-test-question.repository.interface';
import type { IMockTestAIGateway } from '../../domain/services/mock-test-ai.interface';
import type { MockTestAnswerDTO, SubmitAnswerPayloadDTO } from '../mock-tests.dto';
import { MockTestsApplicationError } from '../mock-tests-application.error';
import type { IMockTestScorer } from '../services/test-scorer.service';
import type { IMockTestsMapper } from '../mock-tests.mapper';
import type { IAttemptQuestionSnapshotService } from '../services/attempt-question-snapshot.service';

type SubmitAnswerRepository = IMockTestAttemptRepository &
  IMockTestQuestionRepository &
  IMockTestAnswerRepository &
  IMockTestAIEvaluationRepository;

export interface ISubmitAnswerUseCase {
  execute(
    attemptId: string,
    userId: string,
    payload: SubmitAnswerPayloadDTO
  ): Promise<MockTestAnswerDTO>;
}

export class SubmitAnswerUseCase implements ISubmitAnswerUseCase {
  constructor(
    private readonly _repository: SubmitAnswerRepository,
    private readonly _aiGateway: IMockTestAIGateway,
    private readonly _scorer: IMockTestScorer,
    private readonly _mapper: IMockTestsMapper,
    private readonly _questionSnapshot: IAttemptQuestionSnapshotService
  ) {}

  async execute(attemptId: string, userId: string, payload: SubmitAnswerPayloadDTO) {
    const attempt = await this._repository.findAttemptById(attemptId);

    if (!attempt) {
      throw MockTestsApplicationError.notFound('Attempt not found');
    }

    if (attempt.userId !== userId) {
      throw MockTestsApplicationError.forbidden();
    }

    if (attempt.status !== 'in_progress') {
      throw MockTestsApplicationError.testNotActive();
    }

    const liveQuestion = await this._repository.findQuestionById(payload.questionId);
    const question = this._questionSnapshot.find(attempt, payload.questionId, liveQuestion);

    if (!question || question.testId !== attempt.testId) {
      throw MockTestsApplicationError.notFound('Question not found');
    }

    if (question.type === 'coding') {
      throw MockTestsApplicationError.useCodingSubmitEndpoint();
    }

    const existing = await this._repository.findAnswerByQuestion({
      attemptId,
      questionId: payload.questionId,
    });

    let isCorrect: boolean | undefined;
    let pointsEarned: number | undefined;

    if (question.type === 'mcq') {
      isCorrect = question.correctAnswer
        ? this._scorer.isMCQCorrect(payload.answer, question.correctAnswer)
        : false;

      pointsEarned = isCorrect ? question.points : 0;
    }

    let savedAnswer = existing
      ? await this._repository.updateAnswer(existing._id, {
          answer: payload.answer,
          isCorrect,
          pointsEarned,
        })
      : await this._repository.saveAnswer({
          attemptId,
          questionId: payload.questionId,
          answer: payload.answer,
          isCorrect,
          pointsEarned,
        });

    if (!savedAnswer) {
      throw MockTestsApplicationError.answerSaveFailed();
    }

    if (!existing) {
      await this._repository.incrementAnsweredCount(attemptId);
    }

    if (question.type === 'short_answer') {
      try {
        const evaluation = await this._aiGateway.evaluateOpenAnswer({
          question: question.question,
          correctAnswer: question.correctAnswer,
          userAnswer: payload.answer,
          questionType: question.type,
          maxPoints: question.points,
        });

        await this._repository.createAIEvaluation({
          attemptId,
          questionId: payload.questionId,
          answerId: savedAnswer._id,
          score: evaluation.score,
          maxScore: question.points,
          feedback: evaluation.feedback,
        });

        const evaluatedAnswer = await this._repository.updateAnswer(savedAnswer._id, {
          isCorrect: evaluation.isCorrect,
          pointsEarned: evaluation.score,
        });

        if (evaluatedAnswer) {
          savedAnswer = evaluatedAnswer;
        }
      } catch {
        const fallbackAnswer = await this._repository.updateAnswer(savedAnswer._id, {
          isCorrect: false,
          pointsEarned: 0,
        });

        if (fallbackAnswer) {
          savedAnswer = fallbackAnswer;
        }
      }
    }

    return this._mapper.toAnswer(savedAnswer);
  }
}
