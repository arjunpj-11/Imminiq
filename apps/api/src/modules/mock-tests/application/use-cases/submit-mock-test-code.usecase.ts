import { ApiError } from '../../../../shared/utils/ApiError'
import type { MockTestsRepositoryContract } from '../../domain/repositories/mock-tests.repository.interface'
import type { SubmitMockTestCodePayload } from '../../domain/types/mock-tests.types'
import { runMockTestCodingQuestion } from '../services/mock-test-code-runner.service'

export class SubmitMockTestCodeUseCase {
  constructor(private readonly repo: MockTestsRepositoryContract) {}

  async execute(
    attemptId: string,
    userId: string,
    questionId: string,
    payload: SubmitMockTestCodePayload,
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

    const question = await this.repo.findQuestionById(questionId)

    if (!question || question.testId !== attempt.testId) {
      throw new ApiError(404, 'Question not found', 'NOT_FOUND')
    }

    if (question.type !== 'coding' || !question.coding) {
      throw new ApiError(
        400,
        'This is not a coding question',
        'NOT_CODING_QUESTION',
      )
    }

    const result = await runMockTestCodingQuestion({
      sourceCode: payload.sourceCode,
      coding: question.coding,
      mode: 'submit',
      language: payload.language,
      languageId: payload.languageId,
    })

    const pointsEarned =
      result.totalCount > 0
        ? Math.round((result.passedCount / result.totalCount) * question.points)
        : 0

    const existing = await this.repo.findAnswerByQuestion(
      attemptId,
      questionId,
    )

    const answer = existing
      ? await this.repo.updateAnswer(existing._id, {
          answer: payload.sourceCode,
          isCorrect: result.passed,
          pointsEarned,
          submittedAt: new Date(),
        })
      : await this.repo.saveAnswer({
          attemptId,
          questionId,
          answer: payload.sourceCode,
          isCorrect: result.passed,
          pointsEarned,
        })

    if (!existing) {
      await this.repo.incrementAnsweredCount(attemptId)
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
    }
  }
}