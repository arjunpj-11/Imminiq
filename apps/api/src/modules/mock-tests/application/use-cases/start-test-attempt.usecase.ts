import { MockTestsRepositoryContract } from '../../domain/repositories/mock-tests.repository.interface'
import { ApiError } from '../../../../shared/utils/ApiError'
import { sanitizeQuestionForAttempt } from '../services/test-scorer.service'

export class StartTestAttemptUseCase {
  constructor(private readonly repo: MockTestsRepositoryContract) {}

  async execute(testId: string, userId: string) {
    const test = await this.repo.findTestById(testId)
    if (!test) throw new ApiError(404, 'Test not found', 'NOT_FOUND')
    if (test.visibility === 'private' && test.ownerId !== userId) throw new ApiError(403, 'Forbidden', 'FORBIDDEN')

    const existingAttempt = await this.repo.findActiveAttempt(userId, testId)
    const questions = await this.repo.findQuestionsByTest(testId)
    if (!questions.length) throw new ApiError(400, 'Test has no questions', 'EMPTY_TEST')

    if (existingAttempt) return { attempt: existingAttempt, questions: questions.map(sanitizeQuestionForAttempt) }

    const attempt = await this.repo.createAttempt({ testId, userId, totalQuestions: test.questionCount })
    return { attempt, questions: questions.map(sanitizeQuestionForAttempt) }
  }
}
