import type { MockTestAttemptRepositoryContract } from '../../domain/repositories/mock-test-attempt.repository.interface'
import type { MockTestQuestionRepositoryContract } from '../../domain/repositories/mock-test-question.repository.interface'
import type { MockTestRepositoryContract } from '../../domain/repositories/mock-test.repository.interface'
import { MockTestsApplicationError } from '../errors/mock-tests-application.error'
import type { MockTestsMapperContract } from '../mappers/mock-tests.mapper'

type GetMockTestDetailsRepository =
  MockTestRepositoryContract &
  MockTestQuestionRepositoryContract &
  MockTestAttemptRepositoryContract

export class GetMockTestDetailsUseCase {
  constructor(
    private readonly repo: GetMockTestDetailsRepository,
    private readonly mapper: MockTestsMapperContract,
  ) {}

  async execute(testId: string, userId: string) {
    const test = await this.repo.findTestById(testId)

    if (!test) {
      throw MockTestsApplicationError.notFound('Test not found')
    }

    if (test.visibility === 'private' && test.ownerId !== userId) {
      throw MockTestsApplicationError.forbidden()
    }

    const [questions, attempts] = await Promise.all([
      this.repo.findQuestionsByTest(testId),
      this.repo.findAttemptsByUser({
        userId,
        testId,
      }),
    ])

    const ownsTest = test.ownerId === userId

    return {
      test,
      questions: ownsTest
        ? questions
        : questions.map((question) =>
            this.mapper.sanitizeQuestionForAttempt(question),
          ),
      latestAttempt: attempts[0] || null,
    }
  }
}