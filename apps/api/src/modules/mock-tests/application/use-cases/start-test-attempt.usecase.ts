import type { MockTestAttemptRepositoryContract } from '../../domain/repositories/mock-test-attempt.repository.interface'
import type { MockTestQuestionRepositoryContract } from '../../domain/repositories/mock-test-question.repository.interface'
import type { MockTestRepositoryContract } from '../../domain/repositories/mock-test.repository.interface'
import { MockTestsApplicationError } from '../errors/mock-tests-application.error'
import type { MockTestsMapperContract } from '../mappers/mock-tests.mapper'

type StartTestAttemptRepository =
  MockTestRepositoryContract &
  MockTestQuestionRepositoryContract &
  MockTestAttemptRepositoryContract

export class StartTestAttemptUseCase {
  constructor(
    private readonly _repository: StartTestAttemptRepository,
    private readonly _mapper: MockTestsMapperContract,
  ) {}

  async execute(testId: string, userId: string) {
    const test = await this._repository.findTestById(testId)

    if (!test) {
      throw MockTestsApplicationError.notFound('Test not found')
    }

    if (test.visibility === 'private' && test.ownerId !== userId) {
      throw MockTestsApplicationError.forbidden()
    }

    const existingAttempt = await this._repository.findActiveAttempt({
      userId,
      testId,
    })

    const questions = await this._repository.findQuestionsByTest(testId)

    if (!questions.length) {
      throw MockTestsApplicationError.emptyTest()
    }

    if (existingAttempt) {
      return this._mapper.toAttemptSessionDto(existingAttempt, questions)
    }

    const attempt = await this._repository.createAttempt({
      testId,
      userId,
      totalQuestions: test.questionCount,
    })

    return this._mapper.toAttemptSessionDto(attempt, questions)
  }
}
