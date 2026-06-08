import { MockTestsRepositoryContract } from '../../domain/repositories/mock-tests.repository.interface'
import { ApiError } from '../../../../shared/utils/ApiError'
import { sanitizeQuestionForAttempt } from '../services/test-scorer.service'

export class RetakeTestUseCase {
  constructor(private readonly repo: MockTestsRepositoryContract) {}

  async execute(attemptId: string, userId: string) {
    const attempt = await this.repo.findAttemptById(attemptId)
    if (!attempt) throw new ApiError(404, 'Attempt not found', 'NOT_FOUND')
    if (attempt.userId !== userId) throw new ApiError(403, 'Forbidden', 'FORBIDDEN')
    const test = await this.repo.findTestById(attempt.testId)
    if (!test) throw new ApiError(404, 'Test not found', 'NOT_FOUND')

    await this.repo.abandonActiveAttempts(userId, attempt.testId)
    const newAttempt = await this.repo.createAttempt({ testId: attempt.testId, userId, totalQuestions: test.questionCount })
    const questions = await this.repo.findQuestionsByTest(attempt.testId)
    return { attempt: newAttempt, questions: questions.map(sanitizeQuestionForAttempt) }
  }
}
