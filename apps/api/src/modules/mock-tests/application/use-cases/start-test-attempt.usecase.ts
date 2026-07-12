import type { IMockTestAttemptRepository } from '../../domain/repositories/mock-test-attempt.repository.interface'
import type { IMockTestQuestionRepository } from '../../domain/repositories/mock-test-question.repository.interface'
import type { IMockTestRepository } from '../../domain/repositories/mock-test.repository.interface'
import { MockTestsApplicationError } from '../errors/mock-tests-application.error'
import type { IMockTestsMapper } from '../mappers/mock-tests.mapper'

type StartTestAttemptRepository =
  IMockTestRepository &
  IMockTestQuestionRepository &
  IMockTestAttemptRepository

export interface IStartTestAttemptUseCase {
  execute(testId: string, userId: string): Promise<import("..").IMockTestAttemptSessionDTO>
}

export class StartTestAttemptUseCase implements IStartTestAttemptUseCase {
  constructor(
    private readonly _repository: StartTestAttemptRepository,
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
