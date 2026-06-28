import type { MockTestAnswerRepositoryContract } from '../../domain/repositories/mock-test-answer.repository.interface'
import type { MockTestAttemptRepositoryContract } from '../../domain/repositories/mock-test-attempt.repository.interface'
import { MockTestsApplicationError } from '../errors/mock-tests-application.error'

type FlagQuestionRepository =
  MockTestAttemptRepositoryContract &
  MockTestAnswerRepositoryContract

export class FlagQuestionUseCase {
  constructor(private readonly _repo: FlagQuestionRepository) {}

  async execute(attemptId: string, userId: string, questionId: string) {
    const attempt = await this._repo.findAttemptById(attemptId)

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
      await this._repo.unflagQuestion({
        attemptId,
        questionId,
      })

      return { flagged: false }
    }

    await this._repo.flagQuestion({
      attemptId,
      questionId,
    })

    return { flagged: true }
  }
}