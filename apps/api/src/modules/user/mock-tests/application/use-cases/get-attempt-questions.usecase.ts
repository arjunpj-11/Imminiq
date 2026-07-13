import type { IMockTestAttemptRepository } from '../../domain/repositories/mock-test-attempt.repository.interface'
import type { IMockTestQuestionRepository } from '../../domain/repositories/mock-test-question.repository.interface'
import type { PublicMockTestQuestionDTO } from '../mock-tests.dto'
import type { IMockTestsMapper } from '../mock-tests.mapper'

type GetAttemptQuestionsRepository =
  IMockTestAttemptRepository &
  IMockTestQuestionRepository

export interface IGetAttemptQuestionsUseCase {
  execute(
    attemptId: string,
    userId: string,
  ): Promise<PublicMockTestQuestionDTO[]>
}

export class GetAttemptQuestionsUseCase implements IGetAttemptQuestionsUseCase {
  constructor(
    private readonly _repository: GetAttemptQuestionsRepository,
    private readonly _mapper: IMockTestsMapper,
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
