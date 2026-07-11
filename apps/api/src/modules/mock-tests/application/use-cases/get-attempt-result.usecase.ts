import type { MockTestAIEvaluationRepositoryContract } from '../../domain/repositories/mock-test-ai-evaluation.repository.interface'
import type { MockTestAnswerRepositoryContract } from '../../domain/repositories/mock-test-answer.repository.interface'
import type { MockTestAttemptRepositoryContract } from '../../domain/repositories/mock-test-attempt.repository.interface'
import type { MockTestQuestionRepositoryContract } from '../../domain/repositories/mock-test-question.repository.interface'
import { MockTestsApplicationError } from '../errors/mock-tests-application.error'
import type { MockTestReportRepositoryContract } from '../../domain/repositories/mock-test-report.repository.interface'
import type { MockTestsMapperContract } from '../mappers/mock-tests.mapper'

type GetAttemptResultRepository =
  MockTestAttemptRepositoryContract &
  MockTestAnswerRepositoryContract &
  MockTestQuestionRepositoryContract &
  MockTestAIEvaluationRepositoryContract &
  MockTestReportRepositoryContract

export class GetAttemptResultUseCase {
  constructor(
    private readonly _repository: GetAttemptResultRepository,
    private readonly _mapper: MockTestsMapperContract,
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
