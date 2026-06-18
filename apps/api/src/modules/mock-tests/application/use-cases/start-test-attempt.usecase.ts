import type { MockTestRepositoryContract } from '../../domain/repositories/mock-test.repository.interface'
import type { MockTestQuestionRepositoryContract } from '../../domain/repositories/mock-test-question.repository.interface'
import type { MockTestAttemptRepositoryContract } from '../../domain/repositories/mock-test-attempt.repository.interface'
import type { MockTestsMapperContract } from '../mappers/mock-tests.mapper'
import { MockTestsApplicationError } from '../errors/mock-tests-application.error'

type StartTestAttemptRepository =
  MockTestRepositoryContract &
  MockTestQuestionRepositoryContract &
  MockTestAttemptRepositoryContract

export class StartTestAttemptUseCase {
  constructor(
    private readonly repo: StartTestAttemptRepository,
    private readonly mapper: MockTestsMapperContract,
  ) { }

  async execute(testId: string, userId: string) {
    const test = await this.repo.findTestById(testId)

    if (!test) {
      throw MockTestsApplicationError.notFound('Test not found')
    }

    if (test.visibility === 'private' && test.ownerId !== userId) {
      throw MockTestsApplicationError.forbidden()
    }

    const existingAttempt = await this.repo.findActiveAttempt(userId, testId)
    const questions = await this.repo.findQuestionsByTest(testId)

    if (!questions.length) {
      throw MockTestsApplicationError.emptyTest()
    }

    const safeQuestions = questions.map((question) =>
      this.mapper.sanitizeQuestionForAttempt(question),
    )

    if (existingAttempt) {
      return { attempt: existingAttempt, questions: safeQuestions }
    }

    const attempt = await this.repo.createAttempt({
      testId,
      userId,
      totalQuestions: test.questionCount,
    })

    return { attempt, questions: safeQuestions }
  }
}
