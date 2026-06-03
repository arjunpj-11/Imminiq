import { MockTestsRepositoryContract } from '../../domain/repositories/mock-tests.repository.interface'
import { ApiError } from '../../../../shared/utils/ApiError'

export class FlagQuestionUseCase {
  constructor(private readonly repo: MockTestsRepositoryContract) {}

  async execute(attemptId: string, userId: string, questionId: string) {
    const attempt = await this.repo.findAttemptById(attemptId)
    if (!attempt) throw new ApiError(404, 'Attempt not found', 'NOT_FOUND')
    if (attempt.userId !== userId) throw new ApiError(403, 'Forbidden', 'FORBIDDEN')
    if (attempt.status !== 'in_progress') throw new ApiError(400, 'Test is not in progress', 'TEST_NOT_ACTIVE')

    if (attempt.flaggedQuestions.includes(questionId)) {
      await this.repo.unflagQuestion(attemptId, questionId)
      return { flagged: false }
    }
    await this.repo.flagQuestion(attemptId, questionId)
    return { flagged: true }
  }
}
