import type { IMockTestAnswerRepository } from '../../domain/repositories/mock-test-answer.repository.interface'
import type { IMockTestAttemptRepository } from '../../domain/repositories/mock-test-attempt.repository.interface'
import type { IMockTestQuestionRepository } from '../../domain/repositories/mock-test-question.repository.interface'
import type { IMockTestReportRepository } from '../../domain/repositories/mock-test-report.repository.interface'
import type { IAttemptAnalysisDTO } from '../mock-tests.dto'
import { MockTestsApplicationError } from '../mock-tests-application.error'

type GetAttemptAnalysisRepository =
  IMockTestAttemptRepository &
  IMockTestAnswerRepository &
  IMockTestQuestionRepository &
  IMockTestReportRepository

export interface IGetAttemptAnalysisUseCase {
  execute(attemptId: string, userId: string): Promise<IAttemptAnalysisDTO>
}

export class GetAttemptAnalysisUseCase implements IGetAttemptAnalysisUseCase {
  constructor(private readonly _repository: GetAttemptAnalysisRepository) { }

  async execute(attemptId: string, userId: string): Promise<IAttemptAnalysisDTO> {
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

    const report = await this._repository.findReportByAttempt(attemptId)

    if (!report) {
      throw MockTestsApplicationError.notFound('Report not found')
    }

    const [answers, questions] = await Promise.all([
      this._repository.findAnswersByAttempt(attemptId),
      this._repository.findQuestionsByTest(attempt.testId),
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
