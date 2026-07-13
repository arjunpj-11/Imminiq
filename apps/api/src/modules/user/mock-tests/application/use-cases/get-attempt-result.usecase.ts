import type { IMockTestAIEvaluationRepository } from '../../domain/repositories/mock-test-ai-evaluation.repository.interface'
import type { IMockTestAnswerRepository } from '../../domain/repositories/mock-test-answer.repository.interface'
import type { IMockTestAttemptRepository } from '../../domain/repositories/mock-test-attempt.repository.interface'
import type { IMockTestQuestionRepository } from '../../domain/repositories/mock-test-question.repository.interface'
import { MockTestsApplicationError } from '../mock-tests-application.error'
import type { IMockTestReportRepository } from '../../domain/repositories/mock-test-report.repository.interface'
import type { ITestAttemptResultDTO } from '../mock-tests.dto'
import type { IMockTestsMapper } from '../mock-tests.mapper'

type GetAttemptResultRepository =
  IMockTestAttemptRepository &
  IMockTestAnswerRepository &
  IMockTestQuestionRepository &
  IMockTestAIEvaluationRepository &
  IMockTestReportRepository

export interface IGetAttemptResultUseCase {
  execute(
    attemptId: string,
    userId: string,
  ): Promise<ITestAttemptResultDTO>
}

export class GetAttemptResultUseCase implements IGetAttemptResultUseCase {
  constructor(
    private readonly _repository: GetAttemptResultRepository,
    private readonly _mapper: IMockTestsMapper,
  ) { }

  async execute(attemptId: string, userId: string) {
    const attempt = await this._repository.findAttemptById(attemptId)

    if (!attempt) {
      throw MockTestsApplicationError.notFound('Attempt not found')
    }

    if (attempt.userId !== userId) {
      throw MockTestsApplicationError.forbidden()
    }

    if (attempt.status !== 'completed') {
      throw MockTestsApplicationError.notCompleted()
    }

    const [report, answers, questions, aiEvaluations] = await Promise.all([
      this._repository.findReportByAttempt(attemptId),
      this._repository.findAnswersByAttempt(attemptId),
      this._repository.findQuestionsByTest(attempt.testId),
      this._repository.findAIEvaluationsByAttempt(attemptId),
    ])

    const questionMap = new Map(questions.map((question) => [question._id, question]))
    const aiEvalMap = new Map(
      aiEvaluations.map((evaluation) => [evaluation.answerId, evaluation]),
    )

    return this._mapper.toAttemptResult({
      attempt,
      report,
      answers: answers.map((answer) => ({
        ...answer,
        question: questionMap.get(answer.questionId),
        aiEvaluation: aiEvalMap.get(answer._id),
      })),
    })
  }
}
