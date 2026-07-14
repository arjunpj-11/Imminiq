import type { IDashboardStreakRepository } from '../../domain/repositories/dashboard-streak.repository.interface';
import type { IDashboardTrackerRepository } from '../../domain/repositories/dashboard-tracker.repository.interface';
import type { IDashboardInsightGenerator } from '../../domain/services/dashboard-insight-generator.interface';
import type { DashboardAIInsightResultDTO } from '../dashboard.dto';
import { DashboardApplicationError } from '../dashboard-application.error';

type DashboardInsightRepository = IDashboardStreakRepository & IDashboardTrackerRepository;

export interface IGetAIInsightsUseCase {
  execute(userId: string): Promise<DashboardAIInsightResultDTO>;
}

export class GetAIInsightsUseCase implements IGetAIInsightsUseCase {
  constructor(
    private readonly _dashboardRepository: DashboardInsightRepository,
    private readonly _dashboardInsightGenerator: IDashboardInsightGenerator
  ) {}

  async execute(userId: string): Promise<DashboardAIInsightResultDTO> {
    const [streak, trackers, stats] = await Promise.all([
      this._dashboardRepository.getStreakData(userId),
      this._dashboardRepository.getTrackerOverview(userId),
      this._dashboardRepository.getAggregatedStats(userId),
    ]);

    const userData = JSON.stringify({
      streak: streak.current,
      longestStreak: streak.longest,
      activeTrackers: trackers.active,
      completedTrackers: trackers.completed,
      totalTrackers: trackers.total,
      totalSubtopicsCompleted: stats.totalSubtopicsCompleted,
      totalPoints: stats.totalPoints,
      publishedTrackers: stats.publishedTrackers,
    });

    try {
      const insight = await this._dashboardInsightGenerator.generate(userData);
      return { insight };
    } catch {
      throw DashboardApplicationError.insightGenerationFailed();
    }
  }
}
