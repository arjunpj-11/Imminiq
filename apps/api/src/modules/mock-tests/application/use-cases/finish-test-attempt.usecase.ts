import type { MockTestRepositoryContract } from '../../domain/repositories/mock-test.repository.interface'
import type { MockTestQuestionRepositoryContract } from '../../domain/repositories/mock-test-question.repository.interface'
import type { MockTestAttemptRepositoryContract } from '../../domain/repositories/mock-test-attempt.repository.interface'
import type { MockTestAnswerRepositoryContract } from '../../domain/repositories/mock-test-answer.repository.interface'
import type { MockTestReportRepositoryContract } from '../../domain/repositories/mock-test-report.repository.interface'
import type { MockTestAnalyticsRepositoryContract } from '../../domain/repositories/mock-test-analytics.repository.interface'
import type { MockTestScoringServiceContract } from '../services/test-scorer.service'
import { MockTestsApplicationError } from '../errors/mock-tests-application.error'

type FinishTestAttemptRepository =
  MockTestRepositoryContract &
  MockTestQuestionRepositoryContract &
  MockTestAttemptRepositoryContract &
  MockTestAnswerRepositoryContract &
  MockTestReportRepositoryContract &
  MockTestAnalyticsRepositoryContract

export class FinishTestAttemptUseCase {
  constructor(
    private readonly repo: FinishTestAttemptRepository,
    private readonly scoringService: MockTestScoringServiceContract,
  ) { }

  async execute(attemptId: string, userId: string) {
    const attempt = await this.repo.findAttemptById(attemptId)

    if (!attempt) {
      throw MockTestsApplicationError.notFound('Attempt not found')
    }

    if (attempt.userId !== userId) {
      throw MockTestsApplicationError.forbidden()
    }

    if (attempt.status !== 'in_progress') {
      throw MockTestsApplicationError.testNotActive('Test is already finished')
    }

    const test = await this.repo.findTestById(attempt.testId)

    if (!test) {
      throw MockTestsApplicationError.notFound('Test not found')
    }

    const [questions, answers] = await Promise.all([
      this.repo.findQuestionsByTest(attempt.testId),
      this.repo.findAnswersByAttempt(attemptId),
    ])

    const now = new Date()
    const timeTakenSeconds = Math.round(
      (now.getTime() - new Date(attempt.startedAt).getTime()) / 1000,
    )

    const scoreResult = this.scoringService.calculateTestScore(
      questions,
      answers,
      test.passingScore,
    )

    const { strongTopics, weakTopics } =
      this.scoringService.identifyWeakAndStrongTopics(questions, answers)

    const recommendations = this.scoringService.generateRecommendations(
      scoreResult.scorePercentage,
      weakTopics,
      scoreResult.passed,
    )

    const updatedAttempt = await this.repo.updateAttempt(attemptId, {
      status: 'completed',
      completedAt: now,
      timeTakenSeconds,
      score: scoreResult.earnedPoints,
      scorePercentage: scoreResult.scorePercentage,
      passed: scoreResult.passed,
    })

    const existingReport = await this.repo.findReportByAttempt(attemptId)
    const report = existingReport ||
      await this.repo.createReport({
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
