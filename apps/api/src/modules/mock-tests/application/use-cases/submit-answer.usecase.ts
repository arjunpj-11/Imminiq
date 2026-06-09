import { ApiError } from '../../../../shared/utils/ApiError'
import type { MockTestsRepositoryContract } from '../../domain/repositories/mock-tests.repository.interface'
import type { MockTestAIServiceContract } from '../../domain/services/mock-test-ai.service.interface'
import type { SubmitAnswerPayload } from '../../domain/types/mock-tests.types'
import { isMCQCorrect } from '../services/test-scorer.service'

export class SubmitAnswerUseCase {
  constructor(
    private readonly repo: MockTestsRepositoryContract,
    private readonly aiService: MockTestAIServiceContract,
  ) {}

  async execute(
    attemptId: string,
    userId: string,
    payload: SubmitAnswerPayload,
  ) {
    const attempt = await this.repo.findAttemptById(attemptId)

    if (!attempt) {
      throw new ApiError(404, 'Attempt not found', 'NOT_FOUND')
    }

    if (attempt.userId !== userId) {
      throw new ApiError(403, 'Forbidden', 'FORBIDDEN')
    }

    if (attempt.status !== 'in_progress') {
      throw new ApiError(
        400,
        'Test is not in progress',
        'TEST_NOT_ACTIVE',
      )
    }

    const question = await this.repo.findQuestionById(payload.questionId)

    if (!question || question.testId !== attempt.testId) {
      throw new ApiError(404, 'Question not found', 'NOT_FOUND')
    }

    if (question.type === 'coding') {
      throw new ApiError(
        400,
        'Use the coding submit endpoint for coding questions',
        'USE_CODING_SUBMIT_ENDPOINT',
      )
    }

    const existing = await this.repo.findAnswerByQuestion(
      attemptId,
      payload.questionId,
    )

    let isCorrect: boolean | undefined
    let pointsEarned: number | undefined

    if (question.type === 'mcq') {
      isCorrect = question.correctAnswer
        ? isMCQCorrect(payload.answer, question.correctAnswer)
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
      throw new ApiError(500, 'Failed to save answer', 'ANSWER_SAVE_FAILED')
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
      } catch (error) {
        console.error('Mock test short answer AI evaluation failed', {
          attemptId,
          questionId: payload.questionId,
          answerId: savedAnswer._id,
          error,
        })

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