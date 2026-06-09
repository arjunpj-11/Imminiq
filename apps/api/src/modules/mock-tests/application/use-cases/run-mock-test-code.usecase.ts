import { ApiError } from '../../../../shared/utils/ApiError'
import type { MockTestsRepositoryContract } from '../../domain/repositories/mock-tests.repository.interface'
import type { RunMockTestCodePayload } from '../../domain/types/mock-tests.types'
import { runMockTestCodingQuestion } from '../services/mock-test-code-runner.service'

export class RunMockTestCodeUseCase {
  constructor(private readonly repo: MockTestsRepositoryContract) {}

  async execute(
    attemptId: string,
    userId: string,
    questionId: string,
    payload: RunMockTestCodePayload,
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

    return runMockTestCodingQuestion({
      sourceCode: payload.sourceCode,
      coding: question.coding,
      mode: 'run',
      language: payload.language,
      languageId: payload.languageId,
    })
  }
}