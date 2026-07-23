import type { IMockTestAnswerRepository } from '../../domain/repositories/mock-test-answer.repository.interface';
import type { IMockTestAttemptRepository } from '../../domain/repositories/mock-test-attempt.repository.interface';
import type { IMockTestQuestionRepository } from '../../domain/repositories/mock-test-question.repository.interface';
import type { IMockTestCodeRunner } from '../../domain/services/mock-test-code-runner.interface';
import type { SubmitMockTestCodePayloadDTO, SubmitMockTestCodeResultDTO } from '../mock-tests.dto';
import { MockTestsApplicationError } from '../mock-tests-application.error';
import type { IAttemptQuestionSnapshotService } from '../services/attempt-question-snapshot.service';

type SubmitMockTestCodeRepository = IMockTestAttemptRepository &
  IMockTestQuestionRepository &
  IMockTestAnswerRepository;

export interface ISubmitMockTestCodeUseCase {
  execute(
    attemptId: string,
    userId: string,
    questionId: string,
    payload: SubmitMockTestCodePayloadDTO
  ): Promise<SubmitMockTestCodeResultDTO>;
}

export class SubmitMockTestCodeUseCase implements ISubmitMockTestCodeUseCase {
  constructor(
    private readonly _repository: SubmitMockTestCodeRepository,
    private readonly _codeRunner: IMockTestCodeRunner,
    private readonly _questionSnapshot: IAttemptQuestionSnapshotService
  ) {}

  async execute(
    attemptId: string,
    userId: string,
    questionId: string,
    payload: SubmitMockTestCodePayloadDTO
  ) {
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

    const liveQuestion = await this._repository.findQuestionById(questionId);
    const question = this._questionSnapshot.find(attempt, questionId, liveQuestion);

    if (!question || question.testId !== attempt.testId) {
      throw MockTestsApplicationError.notFound('Question not found');
    }

    if (question.type !== 'coding' || !question.coding) {
      throw MockTestsApplicationError.notCodingQuestion();
    }

    const result = await this._codeRunner.run({
      sourceCode: payload.sourceCode,
      coding: question.coding,
      mode: 'submit',
      language: payload.language,
      languageId: payload.languageId,
    });

    const pointsEarned =
      result.totalCount > 0
        ? Math.round((result.passedCount / result.totalCount) * question.points)
        : 0;

    const existing = await this._repository.findAnswerByQuestion({
      attemptId,
      questionId,
    });

    const answer = existing
      ? await this._repository.updateAnswer(existing._id, {
          answer: payload.sourceCode,
          isCorrect: result.passed,
          pointsEarned,
        })
      : await this._repository.saveAnswer({
          attemptId,
          questionId,
          answer: payload.sourceCode,
          isCorrect: result.passed,
          pointsEarned,
        });

    if (!answer) {
      throw MockTestsApplicationError.answerSaveFailed();
    }

    if (!existing) {
      await this._repository.incrementAnsweredCount(attemptId);
    }

    return {
      answer,
      isCorrect: result.passed,
      pointsEarned,
      maxPoints: question.points,
      passedCount: result.passedCount,
      totalCount: result.totalCount,
      testCases: result.testCases,
      stdout: result.stdout,
      stderr: result.stderr,
      compileOutput: result.compileOutput,
      message: result.message,
      status: result.status,
      feedback: result.passed
        ? 'Accepted. All test cases passed.'
        : `${result.passedCount}/${result.totalCount} test cases passed.`,
    };
  }
}
