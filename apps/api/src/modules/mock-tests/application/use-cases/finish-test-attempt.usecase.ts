import { MockTestsRepositoryContract } from '../../domain/repositories/mock-tests.repository.interface'
import { ApiError } from '../../../../shared/utils/ApiError'
import { calculateTestScore, identifyWeakAndStrongTopics, generateRecommendations } from '../services/test-scorer.service'

export class FinishTestAttemptUseCase {
  constructor(private readonly repo: MockTestsRepositoryContract) {}

  async execute(attemptId: string, userId: string) {
    const attempt = await this.repo.findAttemptById(attemptId)
    if (!attempt) throw new ApiError(404, 'Attempt not found', 'NOT_FOUND')
    if (attempt.userId !== userId) throw new ApiError(403, 'Forbidden', 'FORBIDDEN')
    if (attempt.status !== 'in_progress') throw new ApiError(400, 'Test is already finished', 'TEST_NOT_ACTIVE')

    const test = await this.repo.findTestById(attempt.testId)
    if (!test) throw new ApiError(404, 'Test not found', 'NOT_FOUND')

    const [questions, answers] = await Promise.all([this.repo.findQuestionsByTest(attempt.testId), this.repo.findAnswersByAttempt(attemptId)])
    const now = new Date()
    const timeTakenSeconds = Math.round((now.getTime() - new Date(attempt.startedAt).getTime()) / 1000)
    const scoreResult = calculateTestScore(questions, answers, test.passingScore)
    const { strongTopics, weakTopics } = identifyWeakAndStrongTopics(questions, answers)
    const recommendations = generateRecommendations(scoreResult.scorePercentage, weakTopics, scoreResult.passed)

    const updatedAttempt = await this.repo.updateAttempt(attemptId, {
      status: 'completed',
      completedAt: now,
      timeTakenSeconds,
      score: scoreResult.earnedPoints,
      scorePercentage: scoreResult.scorePercentage,
      passed: scoreResult.passed,
    })

    const existingReport = await this.repo.findReportByAttempt(attemptId)
    const report = existingReport || await this.repo.createReport({
      attemptId,
      userId,
      testId: attempt.testId,
      score: scoreResult.earnedPoints,
      scorePercentage: scoreResult.scorePercentage,
      passed: scoreResult.passed,
      timeTakenSeconds,
      totalQuestions: questions.length,
      correctAnswers: scoreResult.correctCount,
      incorrectAnswers: scoreResult.incorrectCount,
      skippedAnswers: scoreResult.skippedCount,
      strongTopics,
      weakTopics,
      recommendations,
    })

    await this.repo.updateAnalyticsSnapshot(attempt.testId)
    return { attempt: updatedAttempt, report, scoreResult }
  }
}
