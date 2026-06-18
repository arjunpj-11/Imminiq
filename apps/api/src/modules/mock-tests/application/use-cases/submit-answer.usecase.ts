import type { MockTestAIServiceContract } from '../../domain/services/mock-test-ai.service.interface'
import type { MockTestAIEvaluationRepositoryContract } from '../../domain/repositories/mock-test-ai-evaluation.repository.interface'
import type { MockTestAnswerRepositoryContract } from '../../domain/repositories/mock-test-answer.repository.interface'
import type { MockTestAttemptRepositoryContract } from '../../domain/repositories/mock-test-attempt.repository.interface'
import type { MockTestQuestionRepositoryContract } from '../../domain/repositories/mock-test-question.repository.interface'
import type { SubmitAnswerPayload } from '../dtos/mock-tests.dto'
import type { MockTestScoringServiceContract } from '../services/test-scorer.service'
import { MockTestsApplicationError } from '../errors/mock-tests-application.error'

type SubmitAnswerRepository =
  MockTestAttemptRepositoryContract &
  MockTestQuestionRepositoryContract &
  MockTestAnswerRepositoryContract &
  MockTestAIEvaluationRepositoryContract

export class SubmitAnswerUseCase {
  constructor(
    private readonly repo: SubmitAnswerRepository,
    private readonly aiService: MockTestAIServiceContract,
    private readonly scoringService: MockTestScoringServiceContract,
  ) { }

  async execute(
    attemptId: string,
    userId: string,
    payload: SubmitAnswerPayload,
  ) {
    const attempt = await this.repo.findAttemptById(attemptId)

    if (!attempt) {
      throw MockTestsApplicationError.notFound('Attempt not found')
    }

    if (attempt.userId !== userId) {
      throw MockTestsApplicationError.forbidden()
    }

    if (attempt.status !== 'in_progress') {
      throw MockTestsApplicationError.testNotActive()
    }

    const question = await this.repo.findQuestionById(payload.questionId)

    if (!question || question.testId !== attempt.testId) {
      throw MockTestsApplicationError.notFound('Question not found')
    }

    if (question.type === 'coding') {
      throw MockTestsApplicationError.useCodingSubmitEndpoint()
    }

    const existing = await this.repo.findAnswerByQuestion(
      attemptId,
      payload.questionId,
    )

    let isCorrect: boolean | undefined
    let pointsEarned: number | undefined

    if (question.type === 'mcq') {
      isCorrect = question.correctAnswer
        ? this.scoringService.isMCQCorrect(payload.answer, question.correctAnswer)
        : false

      pointsEarned = isCorrect ? question.points : 0
    }

    let savedAnswer = existing
      ? await this.repo.updateAnswer(existing._id, {
        answer: payload.answer,
        isCorrect,
        pointsEarned,
        submittedAt: new Date(),
      })
      : await this.repo.saveAnswer({
        attemptId,
        questionId: payload.questionId,
        answer: payload.answer,
        isCorrect,
        pointsEarned,
      })

    if (!savedAnswer) {
      throw MockTestsApplicationError.answerSaveFailed()
    }

    if (!existing) {
      await this.repo.incrementAnsweredCount(attemptId)
    }

    if (question.type === 'short_answer') {
      try {
        const evaluation = await this.aiService.evaluateOpenAnswer({
          question: question.question,
          correctAnswer: question.correctAnswer,
          userAnswer: payload.answer,
          questionType: question.type,
          maxPoints: question.points,
        })

        const aiEval = await this.repo.createAIEvaluation({
          attemptId,
          questionId: payload.questionId,
          answerId: savedAnswer._id,
          score: evaluation.score,
          maxScore: question.points,
          feedback: evaluation.feedback,
        })

        const evaluatedAnswer = await this.repo.updateAnswer(savedAnswer._id, {
          isCorrect: evaluation.isCorrect,
          pointsEarned: evaluation.score,
          aiEvaluationId: aiEval._id,
        })

        if (evaluatedAnswer) {
          savedAnswer = evaluatedAnswer
        }
      } catch {
        const fallbackAnswer = await this.repo.updateAnswer(savedAnswer._id, {
          isCorrect: false,
          pointsEarned: 0,
        })

        if (fallbackAnswer) {
          savedAnswer = fallbackAnswer
        }
      }
    }

    return savedAnswer
  }
}
