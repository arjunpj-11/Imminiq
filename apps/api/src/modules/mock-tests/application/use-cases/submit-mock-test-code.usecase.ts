import type { MockTestAnswerRepositoryContract } from '../../domain/repositories/mock-test-answer.repository.interface'
import type { MockTestAttemptRepositoryContract } from '../../domain/repositories/mock-test-attempt.repository.interface'
import type { MockTestQuestionRepositoryContract } from '../../domain/repositories/mock-test-question.repository.interface'
import type { MockTestCodeRunnerContract } from '../../domain/services/mock-test-code-runner.interface'
import type { SubmitMockTestCodePayload } from '../dtos/mock-tests.dto'
import { MockTestsApplicationError } from '../errors/mock-tests-application.error'

type SubmitMockTestCodeRepository =
  MockTestAttemptRepositoryContract &
  MockTestQuestionRepositoryContract &
  MockTestAnswerRepositoryContract

export class SubmitMockTestCodeUseCase {
  constructor(
    private readonly _repository: SubmitMockTestCodeRepository,
    private readonly _codeRunner: MockTestCodeRunnerContract,
  ) {}

  async execute(
    attemptId: string,
    userId: string,
    questionId: string,
    payload: SubmitMockTestCodePayload,
  ) {
    const attempt = await this._repository.findAttemptById(attemptId)

    if (!attempt) {
      throw MockTestsApplicationError.notFound('Attempt not found')
    }

    if (attempt.userId !== userId) {
      throw MockTestsApplicationError.forbidden()
    }

    if (attempt.status !== 'in_progress') {
      throw MockTestsApplicationError.testNotActive()
    }

    const question = await this._repository.findQuestionById(questionId)

    if (!question || question.testId !== attempt.testId) {
      throw MockTestsApplicationError.notFound('Question not found')
    }

    if (question.type !== 'coding' || !question.coding) {
      throw MockTestsApplicationError.notCodingQuestion()
    }

    const result = await this._codeRunner.run({
      sourceCode: payload.sourceCode,
      coding: question.coding,
      mode: 'submit',
      language: payload.language,
      languageId: payload.languageId,
    })

    const pointsEarned =
      result.totalCount > 0
        ? Math.round((result.passedCount / result.totalCount) * question.points)
        : 0

    const existing = await this._repository.findAnswerByQuestion({
      attemptId,
      questionId,
    })

    const answer = existing
      ? await this._repository.updateAnswer(existing._id, {
          answer: payload.sourceCode,
          isCorrect: result.passed,
          pointsEarned,
        })
      : await this._repository.saveAnswer({
          attemptId,
          questionId,
          answer: payload.sourceCode,
          isCorrect: result.passed,
          pointsEarned,
        })

    if (!answer) {
      throw MockTestsApplicationError.answerSaveFailed()
    }

    if (!existing) {
      await this._repository.incrementAnsweredCount(attemptId)
    }

    return {
      answer,
      isCorrect: result.passed,
      pointsEarned,
      maxPoints: question.points,
      passedCount: result.passedCount,
      totalCount: result.totalCount,
      testCases: result.testCases,
      stdout: result.stdout,
      stderr: result.stderr,
      compileOutput: result.compileOutput,
      message: result.message,
      status: result.status,
      feedback: result.passed
        ? 'Accepted. All test cases passed.'
        : `${result.passedCount}/${result.totalCount} test cases passed.`,
    }
  }
}