import type { MockTestAttemptRepositoryContract } from '../../domain/repositories/mock-test-attempt.repository.interface'
import type { MockTestQuestionRepositoryContract } from '../../domain/repositories/mock-test-question.repository.interface'
import type { MockTestsMapperContract } from '../mappers/mock-tests.mapper'

type GetAttemptQuestionsRepository =
  MockTestAttemptRepositoryContract &
  MockTestQuestionRepositoryContract

export class GetAttemptQuestionsUseCase {
  constructor(
    private readonly _repository: GetAttemptQuestionsRepository,
    private readonly _mapper: MockTestsMapperContract,
  ) { }

  async execute(attemptId: string, userId: string) {
    const attempt = await this._repository.findAttemptById(attemptId)

    if (!attempt || attempt.userId !== userId) {
      return []
    }

    const questions = await this._repository.findQuestionsByTest(attempt.testId)

    return questions.map((question) => this._mapper.sanitizeQuestionForAttempt(question))
  }
}
