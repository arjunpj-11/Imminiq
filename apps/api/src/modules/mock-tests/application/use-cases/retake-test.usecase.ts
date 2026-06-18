import type { MockTestRepositoryContract } from '../../domain/repositories/mock-test.repository.interface'
import type { MockTestQuestionRepositoryContract } from '../../domain/repositories/mock-test-question.repository.interface'
import type { MockTestAttemptRepositoryContract } from '../../domain/repositories/mock-test-attempt.repository.interface'
import type { MockTestsMapperContract } from '../mappers/mock-tests.mapper'
import { MockTestsApplicationError } from '../errors/mock-tests-application.error'

type RetakeTestRepository =
  MockTestRepositoryContract &
  MockTestQuestionRepositoryContract &
  MockTestAttemptRepositoryContract

export class RetakeTestUseCase {
  constructor(
    private readonly repo: RetakeTestRepository,
    private readonly mapper: MockTestsMapperContract,
  ) { }

  async execute(attemptId: string, userId: string) {
    const attempt = await this.repo.findAttemptById(attemptId)

    if (!attempt) {
      throw MockTestsApplicationError.notFound('Attempt not found')
    }

    if (attempt.userId !== userId) {
      throw MockTestsApplicationError.forbidden()
    }

    const test = await this.repo.findTestById(attempt.testId)

    if (!test) {
      throw MockTestsApplicationError.notFound('Test not found')
    }

    await this.repo.abandonActiveAttempts(userId, attempt.testId)

    const newAttempt = await this.repo.createAttempt({
      testId: attempt.testId,
      userId,
      totalQuestions: test.questionCount,
    })

    const questions = await this.repo.findQuestionsByTest(attempt.testId)

    return {
      attempt: newAttempt,
      questions: questions.map((question) => this.mapper.sanitizeQuestionForAttempt(question)),
    }
  }
}
