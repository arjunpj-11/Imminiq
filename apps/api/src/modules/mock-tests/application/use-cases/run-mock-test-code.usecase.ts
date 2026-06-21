import type { MockTestAttemptRepositoryContract } from '../../domain/repositories/mock-test-attempt.repository.interface'
import type { MockTestQuestionRepositoryContract } from '../../domain/repositories/mock-test-question.repository.interface'
import type { MockTestCodeRunnerServiceContract } from '../../domain/services/mock-test-code-runner.service.interface'
import type { RunMockTestCodePayload } from '../dtos/mock-tests.dto'
import { MockTestsApplicationError } from '../errors/mock-tests-application.error'

type RunMockTestCodeRepository =
  MockTestAttemptRepositoryContract &
  MockTestQuestionRepositoryContract

export class RunMockTestCodeUseCase {
  constructor(
    private readonly repo: RunMockTestCodeRepository,
    private readonly codeRunner: MockTestCodeRunnerServiceContract,
  ) { }

  async execute(
    attemptId: string,
    userId: string,
    questionId: string,
    payload: RunMockTestCodePayload,
  ) {
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

    const question = await this.repo.findQuestionById(questionId)

    if (!question || question.testId !== attempt.testId) {
      throw MockTestsApplicationError.notFound('Question not found')
    }

    if (question.type !== 'coding' || !question.coding) {
      throw MockTestsApplicationError.notCodingQuestion()
    }

    return this.codeRunner.run({
      sourceCode: payload.sourceCode,
      coding: question.coding,
      mode: 'run',
      language: payload.language,
      languageId: payload.languageId,
    })
  }
}
