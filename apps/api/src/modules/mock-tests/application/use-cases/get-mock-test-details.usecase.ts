import { MockTestsRepositoryContract } from '../../domain/repositories/mock-tests.repository.interface'
import { ApiError } from '../../../../shared/utils/ApiError'
import { sanitizeQuestionForAttempt } from '../services/test-scorer.service'

export class GetMockTestDetailsUseCase {
  constructor(private readonly repo: MockTestsRepositoryContract) {}

  async execute(testId: string, userId: string) {
    const test = await this.repo.findTestById(testId)
    if (!test) throw new ApiError(404, 'Test not found', 'NOT_FOUND')
    if (test.visibility === 'private' && test.ownerId !== userId) throw new ApiError(403, 'Forbidden', 'FORBIDDEN')

    const [questions, attempts] = await Promise.all([
      this.repo.findQuestionsByTest(testId),
      this.repo.findAttemptsByUser(userId, testId),
    ])

    const ownsTest = test.ownerId === userId
    return {
      test,
      questions: ownsTest ? questions : questions.map(sanitizeQuestionForAttempt),
      latestAttempt: attempts[0] || null,
    }
  }
}
