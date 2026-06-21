import type { MockTestAnswerRepositoryContract } from '../../domain/repositories/mock-test-answer.repository.interface'
import type { MockTestAttemptRepositoryContract } from '../../domain/repositories/mock-test-attempt.repository.interface'
import type { MockTestQuestionRepositoryContract } from '../../domain/repositories/mock-test-question.repository.interface'
import type { MockTestReportRepositoryContract } from '../../domain/repositories/mock-test-report.repository.interface'
import type { AttemptAnalysis } from '../dtos/mock-tests.dto'
import { MockTestsApplicationError } from '../errors/mock-tests-application.error'

type GetAttemptAnalysisRepository =
  MockTestAttemptRepositoryContract &
  MockTestAnswerRepositoryContract &
  MockTestQuestionRepositoryContract &
  MockTestReportRepositoryContract

export class GetAttemptAnalysisUseCase {
  constructor(private readonly repo: GetAttemptAnalysisRepository) { }

  async execute(attemptId: string, userId: string): Promise<AttemptAnalysis> {
    const attempt = await this.repo.findAttemptById(attemptId)

    if (!attempt) {
      throw MockTestsApplicationError.notFound('Attempt not found')
    }

    if (attempt.userId !== userId) {
      throw MockTestsApplicationError.forbidden()
    }

    if (attempt.status !== 'completed') {
      throw MockTestsApplicationError.notCompleted()
    }

    const report = await this.repo.findReportByAttempt(attemptId)

    if (!report) {
      throw MockTestsApplicationError.notFound('Report not found')
    }

    const [answers, questions] = await Promise.all([
      this.repo.findAnswersByAttempt(attemptId),
      this.repo.findQuestionsByTest(attempt.testId),
    ])

    const answerMap = new Map(answers.map((answer) => [answer.questionId, answer]))

    return {
      score: attempt.score || 0,
      scorePercentage: attempt.scorePercentage || 0,
      passed: attempt.passed || false,
      strongTopics: report.strongTopics,
      weakTopics: report.weakTopics,
      recommendations: report.recommendations,
      questionBreakdown: questions.map((question) => {
        const answer = answerMap.get(question._id)

        return {
          questionId: question._id,
          question: question.question,
          isCorrect: answer?.isCorrect || false,
          yourAnswer: answer?.answer || '',
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          pointsEarned: answer?.pointsEarned || 0,
          maxPoints: question.points,
        }
      }),
    }
  }
}
