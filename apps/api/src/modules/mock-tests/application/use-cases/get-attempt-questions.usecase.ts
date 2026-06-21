import type { MockTestAttemptRepositoryContract } from '../../domain/repositories/mock-test-attempt.repository.interface'
import type { MockTestQuestionRepositoryContract } from '../../domain/repositories/mock-test-question.repository.interface'
import type { MockTestsMapperContract } from '../mappers/mock-tests.mapper'

type GetAttemptQuestionsRepository =
  MockTestAttemptRepositoryContract &
  MockTestQuestionRepositoryContract

export class GetAttemptQuestionsUseCase {
  constructor(
    private readonly repo: GetAttemptQuestionsRepository,
    private readonly mapper: MockTestsMapperContract,
  ) { }

  async execute(attemptId: string, userId: string) {
    const attempt = await this.repo.findAttemptById(attemptId)

    if (!attempt || attempt.userId !== userId) {
      return []
    }

    const questions = await this.repo.findQuestionsByTest(attempt.testId)

    return questions.map((question) => this.mapper.sanitizeQuestionForAttempt(question))
  }
}
