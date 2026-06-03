import { MockTestsRepositoryContract } from '../../domain/repositories/mock-tests.repository.interface'
import { ApiError } from '../../../../shared/utils/ApiError'
import { AttemptAnalysis } from '../../domain/types/mock-tests.types'

export class GetAttemptAnalysisUseCase {
  constructor(private readonly repo: MockTestsRepositoryContract) {}

  async execute(attemptId: string, userId: string): Promise<AttemptAnalysis> {
    const attempt = await this.repo.findAttemptById(attemptId)
    if (!attempt) throw new ApiError(404, 'Attempt not found', 'NOT_FOUND')
    if (attempt.userId !== userId) throw new ApiError(403, 'Forbidden', 'FORBIDDEN')
    if (attempt.status !== 'completed') throw new ApiError(400, 'Test not completed yet', 'NOT_COMPLETED')

    const report = await this.repo.findReportByAttempt(attemptId)
    if (!report) throw new ApiError(404, 'Report not found', 'NOT_FOUND')
    const [answers, questions] = await Promise.all([this.repo.findAnswersByAttempt(attemptId), this.repo.findQuestionsByTest(attempt.testId)])
    const answerMap = new Map(answers.map((a) => [a.questionId, a]))

    return {
      score: attempt.score || 0,
      scorePercentage: attempt.scorePercentage || 0,
      passed: attempt.passed || false,
      strongTopics: report.strongTopics,
      weakTopics: report.weakTopics,
      recommendations: report.recommendations,
      questionBreakdown: questions.map((q) => {
        const answer = answerMap.get(q._id)
        return { questionId: q._id, question: q.question, isCorrect: answer?.isCorrect || false, yourAnswer: answer?.answer || '', correctAnswer: q.correctAnswer, explanation: q.explanation, pointsEarned: answer?.pointsEarned || 0, maxPoints: q.points }
      }),
    }
  }
}
