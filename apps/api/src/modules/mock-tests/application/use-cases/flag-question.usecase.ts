import type { MockTestAnswerRepositoryContract } from '../../domain/repositories/mock-test-answer.repository.interface'
import type { MockTestAttemptRepositoryContract } from '../../domain/repositories/mock-test-attempt.repository.interface'
import { MockTestsApplicationError } from '../errors/mock-tests-application.error'

type FlagQuestionRepository =
  MockTestAttemptRepositoryContract &
  MockTestAnswerRepositoryContract

export class FlagQuestionUseCase {
  constructor(private readonly repo: FlagQuestionRepository) {}

  async execute(attemptId: string, userId: string, questionId: string) {
    const attempt = await this.repo.findAttemptById(attemptId)

    if (!attempt) {
      throw MockTestsApplicationError.notFound('Attempt not found')
    }

    if (attempt.userId !== userId) {
      throw MockTestsApplicationError.forbidden()
    }

    if (attempt.status !== 'in_progress') {
      throw MockTestsApplicationError.testNotActive()
    }

    if (attempt.flaggedQuestions.includes(questionId)) {
      await this.repo.unflagQuestion({
        attemptId,
        questionId,
      })

      return { flagged: false }
    }

    await this.repo.flagQuestion({
      attemptId,
      questionId,
    })

    return { flagged: true }
  }
}