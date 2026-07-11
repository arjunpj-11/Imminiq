import type { IMockTestAttemptRepository } from '../../domain/repositories/mock-test-attempt.repository.interface'
import type { IMockTestQuestionRepository } from '../../domain/repositories/mock-test-question.repository.interface'
import type { IMockTestRepository } from '../../domain/repositories/mock-test.repository.interface'
import { MockTestsApplicationError } from '../errors/mock-tests-application.error'
import type { IMockTestsMapper } from '../mappers/mock-tests.mapper'

type GetMockTestDetailsRepository =
  IMockTestRepository &
  IMockTestQuestionRepository &
  IMockTestAttemptRepository

export class GetMockTestDetailsUseCase {
  constructor(
    private readonly _repository: GetMockTestDetailsRepository,
    private readonly _mapper: IMockTestsMapper,
  ) {}

  async execute(testId: string, userId: string) {
    const test = await this._repository.findTestById(testId)

    if (!test) {
      throw MockTestsApplicationError.notFound('Test not found')
    }

    if (test.visibility === 'private' && test.ownerId !== userId) {
      throw MockTestsApplicationError.forbidden()
    }

    const [questions, attempts] = await Promise.all([
      this._repository.findQuestionsByTest(testId),
      this._repository.findAttemptsByUser({
        userId,
        testId,
      }),
    ])

    const ownsTest = test.ownerId === userId

    return this._mapper.toDetailsDto({
      test,
      questions,
      latestAttempt: attempts[0] || null,
      includeAnswers: ownsTest,
    })
  }
}
