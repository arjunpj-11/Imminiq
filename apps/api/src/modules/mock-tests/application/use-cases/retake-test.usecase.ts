import type { MockTestAttemptRepositoryContract } from '../../domain/repositories/mock-test-attempt.repository.interface'
import type { MockTestQuestionRepositoryContract } from '../../domain/repositories/mock-test-question.repository.interface'
import type { MockTestRepositoryContract } from '../../domain/repositories/mock-test.repository.interface'
import { MockTestsApplicationError } from '../errors/mock-tests-application.error'
import type { MockTestsMapperContract } from '../mappers/mock-tests.mapper'

type RetakeTestRepository =
  MockTestRepositoryContract &
  MockTestQuestionRepositoryContract &
  MockTestAttemptRepositoryContract

export class RetakeTestUseCase {
  constructor(
    private readonly _repo: RetakeTestRepository,
    private readonly _mapper: MockTestsMapperContract,
  ) {}

  async execute(attemptId: string, userId: string) {
    const attempt = await this._repo.findAttemptById(attemptId)

    if (!attempt) {
      throw MockTestsApplicationError.notFound('Attempt not found')
    }

    if (attempt.userId !== userId) {
      throw MockTestsApplicationError.forbidden()
    }

    const test = await this._repo.findTestById(attempt.testId)

    if (!test) {
      throw MockTestsApplicationError.notFound('Test not found')
    }

    await this._repo.abandonActiveAttempts({
      userId,
      testId: attempt.testId,
    })

    const newAttempt = await this._repo.createAttempt({
      testId: attempt.testId,
      userId,
      totalQuestions: test.questionCount,
    })

    const questions = await this._repo.findQuestionsByTest(attempt.testId)

    return this._mapper.toAttemptSessionDto(newAttempt, questions)
  }
}
