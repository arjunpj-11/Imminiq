import type { IMockTestAnalyticsRepository } from '../../domain/repositories/mock-test-analytics.repository.interface';
import type { IMockTestAnswerRepository } from '../../domain/repositories/mock-test-answer.repository.interface';
import type { IMockTestAttemptRepository } from '../../domain/repositories/mock-test-attempt.repository.interface';
import type { IMockTestQuestionRepository } from '../../domain/repositories/mock-test-question.repository.interface';
import type { IMockTestReportRepository } from '../../domain/repositories/mock-test-report.repository.interface';
import type { IMockTestRepository } from '../../domain/repositories/mock-test.repository.interface';
import type { IMockTestActivityRecorder } from '../../domain/services/mock-test-activity.interface';
import { MockTestsApplicationError } from '../mock-tests-application.error';
import type { IMockTestScorer } from '../services/test-scorer.service';
import type { IMockTestsMapper } from '../mock-tests.mapper';
import type { IClock } from '../../../../../shared/time/clock.interface';
import type { IMockTestCompletionObserver } from '../../domain/services/mock-test-completion-observer.interface';
import type { FinishMockTestAttemptDTO } from '../mock-tests.dto';

const MOCK_TEST_COMPLETION_XP = 50;

type FinishTestAttemptRepository = IMockTestRepository &
  IMockTestQuestionRepository &
  IMockTestAttemptRepository &
  IMockTestAnswerRepository &
  IMockTestReportRepository &
  IMockTestAnalyticsRepository;

type QuestionScoreLike = {
  points?: number;
};

export interface IFinishTestAttemptUseCase {
  execute(attemptId: string, userId: string): Promise<FinishMockTestAttemptDTO>;
}

export class FinishTestAttemptUseCase implements IFinishTestAttemptUseCase {
  constructor(
    private readonly _repository: FinishTestAttemptRepository,

    private readonly _scorer: IMockTestScorer,

    private readonly _activityRecorder: IMockTestActivityRecorder,

    private readonly _mapper: IMockTestsMapper,

    private readonly _clock: IClock,
    private readonly _completionObserver?: IMockTestCompletionObserver
  ) {}

  async execute(attemptId: string, userId: string) {
    const attempt = await this._repository.findAttemptById(attemptId);

    if (!attempt) {
      throw MockTestsApplicationError.notFound('Attempt not found');
    }

    if (attempt.userId !== userId) {
      throw MockTestsApplicationError.forbidden();
    }

    /*
     * A completed attempt is allowed here so that the request
     * can recover when:
     *
     * 1. the report and attempt were saved successfully
     * 2. activity recording failed afterward
     * 3. the client retries the finish request
     *
     * The activity event key uses attemptId, so retrying cannot
     * duplicate XP, leaderboard records, or streak activity.
     */
    if (attempt.status !== 'in_progress' && attempt.status !== 'completed') {
      throw MockTestsApplicationError.testNotActive('Test attempt is not active');
    }

    const test = await this._repository.findTestById(attempt.testId);

    if (!test) {
      throw MockTestsApplicationError.notFound('Test not found');
    }

    const [questions, answers] = await Promise.all([
      this._repository.findQuestionsByTest(attempt.testId),

      this._repository.findAnswersByAttempt(attemptId),
    ]);

    const completedAt = attempt.completedAt ?? this._clock.now();

    const calculatedTimeTakenSeconds = Math.max(
      0,
      Math.floor((completedAt.getTime() - new Date(attempt.startedAt).getTime()) / 1000)
    );

    const timeTakenSeconds = attempt.timeTakenSeconds ?? calculatedTimeTakenSeconds;

    const scoreResult = this._scorer.calculateTestScore(questions, answers, test.passingScore);

    const maxScore = this.calculateMaxScore(questions);

    const totalQuestions = questions.length;

    /*
     * findAnswersByAttempt() should return one answer for each
     * answered question.
     */
    const answeredQuestions = Math.min(totalQuestions, answers.length);

    const correctAnswers = Math.min(answeredQuestions, Math.max(0, scoreResult.correctCount));

    const incorrectAnswers = Math.max(0, answeredQuestions - correctAnswers);

    const skippedAnswers = Math.max(0, totalQuestions - answeredQuestions);

    const { strongTopics, weakTopics } = this._scorer.identifyWeakAndStrongTopics(
      questions,
      answers
    );

    const recommendations = this._scorer.generateRecommendations(
      scoreResult.scorePercentage,
      weakTopics,
      scoreResult.passed
    );

    /*
     * Reuse the existing report during a retry.
     *
     * If report creation previously succeeded but attempt or
     * activity updating failed, a duplicate report will not be
     * created.
     */
    const existingReport = await this._repository.findReportByAttempt(attemptId);

    const report =
      existingReport ??
      (await this._repository.createReport({
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
      }));

    let completedAttempt = attempt;

    /*
     * Do not rewrite an attempt that is already completed.
     * That state can occur when only the activity call failed
     * in a previous request.
     */
    if (attempt.status === 'in_progress') {
      const updatedAttempt = await this._repository.updateAttempt(attemptId, {
        status: 'completed',
        completedAt,

        timeSpentSeconds: report.timeTakenSeconds,

        score: report.score,
        maxScore,

        percentage: report.scorePercentage,

        passed: report.passed,

        answeredCount: Math.max(0, report.totalQuestions - report.skippedAnswers),

        correctCount: report.correctAnswers,
      });

      if (!updatedAttempt) {
        throw MockTestsApplicationError.notFound('Attempt could not be completed');
      }

      completedAttempt = updatedAttempt;
    }

    await this._repository.updateAnalyticsSnapshot(attempt.testId);

    /*
     * The activity module handles:
     *
     * - User.xp
     * - User.level
     * - LeaderboardXpEvent
     * - StreakHistory
     * - StreakSnapshot
     * - UserActivity
     * - daily-goal reward checking
     */
    await this._activityRecorder.recordMockTestCompleted({
      userId,
      mockTestId: test._id,
      attemptId: attempt._id,

      ...(test.trackerId
        ? {
            trackerId: test.trackerId,
          }
        : {}),

      testTitle: test.title,
      difficulty: test.difficulty,

      scorePercentage: report.scorePercentage,

      totalQuestions: report.totalQuestions,

      correctAnswers: report.correctAnswers,

      durationSeconds: report.timeTakenSeconds,

      passed: report.passed,

      xpAwarded: MOCK_TEST_COMPLETION_XP,
    });

    await this._completionObserver?.onCompleted({
      userId,
      testId: test._id,
      attemptId: attempt._id,
      scorePercentage: report.scorePercentage,
    });

    return this._mapper.toFinishAttemptDto({
      attempt: completedAttempt,
      report,
      scoreResult,
    });
  }

  private calculateMaxScore(questions: QuestionScoreLike[]): number {
    return questions.reduce((total, question) => total + (question.points ?? 1), 0);
  }
}
