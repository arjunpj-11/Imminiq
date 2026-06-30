import type { MockTestAnalyticsRepositoryContract } from '../../domain/repositories/mock-test-analytics.repository.interface'
import type { MockTestAnswerRepositoryContract } from '../../domain/repositories/mock-test-answer.repository.interface'
import type { MockTestAttemptRepositoryContract } from '../../domain/repositories/mock-test-attempt.repository.interface'
import type { MockTestQuestionRepositoryContract } from '../../domain/repositories/mock-test-question.repository.interface'
import type { MockTestReportRepositoryContract } from '../../domain/repositories/mock-test-report.repository.interface'
import type { MockTestRepositoryContract } from '../../domain/repositories/mock-test.repository.interface'
import { MockTestsApplicationError } from '../errors/mock-tests-application.error'
import type { MockTestScoringServiceContract } from '../services/test-scorer.service'

type FinishTestAttemptRepository =
  MockTestRepositoryContract &
  MockTestQuestionRepositoryContract &
  MockTestAttemptRepositoryContract &
  MockTestAnswerRepositoryContract &
  MockTestReportRepositoryContract &
  MockTestAnalyticsRepositoryContract

type QuestionScoreLike = {
  points?: number
}

export class FinishTestAttemptUseCase {
  constructor(
    private readonly _repo: FinishTestAttemptRepository,
    private readonly _scoringService: MockTestScoringServiceContract,
  ) {}

  async execute(attemptId: string, userId: string) {
    const attempt = await this._repo.findAttemptById(attemptId)

    if (!attempt) {
      throw MockTestsApplicationError.notFound('Attempt not found')
    }

    if (attempt.userId !== userId) {
      throw MockTestsApplicationError.forbidden()
    }

    if (attempt.status !== 'in_progress') {
      throw MockTestsApplicationError.testNotActive(
        'Test is already finished',
      )
    }

    const test = await this._repo.findTestById(attempt.testId)

    if (!test) {
      throw MockTestsApplicationError.notFound('Test not found')
    }

    const [questions, answers] = await Promise.all([
      this._repo.findQuestionsByTest(attempt.testId),
      this._repo.findAnswersByAttempt(attemptId),
    ])

    const completedAt = new Date()

    const timeTakenSeconds = Math.max(
      0,
      Math.floor(
        (completedAt.getTime() -
          new Date(attempt.startedAt).getTime()) /
          1000,
      ),
    )

    const scoreResult =
      this._scoringService.calculateTestScore(
        questions,
        answers,
        test.passingScore,
      )

    const maxScore = this.calculateMaxScore(questions)
    const totalQuestions = questions.length

    /*
     * Assumes findAnswersByAttempt() returns one record only for
     * questions that were answered.
     */
    const answeredQuestions = Math.min(
      totalQuestions,
      answers.length,
    )

    const correctAnswers = Math.min(
      answeredQuestions,
      Math.max(0, scoreResult.correctCount),
    )

    const incorrectAnswers = Math.max(
      0,
      answeredQuestions - correctAnswers,
    )

    const skippedAnswers = Math.max(
      0,
      totalQuestions - answeredQuestions,
    )

    const { strongTopics, weakTopics } =
      this._scoringService.identifyWeakAndStrongTopics(
        questions,
        answers,
      )

    const recommendations =
      this._scoringService.generateRecommendations(
        scoreResult.scorePercentage,
        weakTopics,
        scoreResult.passed,
      )

    /*
     * Create the report before completing the attempt.
     *
     * If report creation fails, the attempt remains in_progress
     * and the user can safely retry.
     */
    const existingReport =
      await this._repo.findReportByAttempt(attemptId)

    const report =
      existingReport ??
      (await this._repo.createReport({
        attemptId,
        testId: attempt.testId,
        userId,

        score: scoreResult.earnedPoints,
        maxScore,
        scorePercentage: scoreResult.scorePercentage,
        passed: scoreResult.passed,

        totalQuestions,
        correctAnswers,
        incorrectAnswers,
        skippedAnswers,
        timeTakenSeconds,

        weakTopics,
        strongTopics,
        recommendations,

        generatedAt: completedAt,
      }))

    /*
     * Complete the attempt only after the report exists.
     */
    const updatedAttempt = await this._repo.updateAttempt(
      attemptId,
      {
        status: 'completed',
        completedAt,
        timeSpentSeconds: timeTakenSeconds,
        score: scoreResult.earnedPoints,
        percentage: scoreResult.scorePercentage,
      },
    )

    await this._repo.updateAnalyticsSnapshot(attempt.testId)

    return {
      attempt: updatedAttempt,
      report,
      scoreResult,
    }
  }

  private calculateMaxScore(
    questions: QuestionScoreLike[],
  ): number {
    return questions.reduce(
      (total, question) =>
        total + (question.points ?? 1),
      0,
    )
  }
}