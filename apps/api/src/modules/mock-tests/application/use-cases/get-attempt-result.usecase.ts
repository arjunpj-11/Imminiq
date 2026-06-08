import { MockTestsRepositoryContract } from '../../domain/repositories/mock-tests.repository.interface'
import { ApiError } from '../../../../shared/utils/ApiError'

export class GetAttemptResultUseCase {
  constructor(private readonly repo: MockTestsRepositoryContract) {}

  async execute(attemptId: string, userId: string) {
    const attempt = await this.repo.findAttemptById(attemptId)
    if (!attempt) throw new ApiError(404, 'Attempt not found', 'NOT_FOUND')
    if (attempt.userId !== userId) throw new ApiError(403, 'Forbidden', 'FORBIDDEN')
    if (attempt.status !== 'completed') throw new ApiError(400, 'Test not completed yet', 'NOT_COMPLETED')

    const [report, answers, questions, aiEvaluations] = await Promise.all([
      this.repo.findReportByAttempt(attemptId),
      this.repo.findAnswersByAttempt(attemptId),
      this.repo.findQuestionsByTest(attempt.testId),
      this.repo.findAIEvaluationsByAttempt(attemptId),
    ])
    const questionMap = new Map(questions.map((q) => [q._id, q]))
    const aiEvalMap = new Map(aiEvaluations.map((e) => [e.answerId, e]))
    return { attempt, report, answers: answers.map((a) => ({ ...a, question: questionMap.get(a.questionId), aiEvaluation: aiEvalMap.get(a._id) })) }
  }
}
