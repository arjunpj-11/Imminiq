import type { DashboardStreakRepositoryContract } from '../../domain/repositories/dashboard-streak.repository.interface'
import type { DashboardTrackerRepositoryContract } from '../../domain/repositories/dashboard-tracker.repository.interface'
import type { DashboardInsightGeneratorContract } from '../../domain/services/dashboard-insight-generator.interface'
import type { DashboardAIInsightResult } from '../dtos/dashboard.dto'
import { DashboardApplicationError } from '../errors/dashboard-application.error'

type DashboardInsightRepository =
  DashboardStreakRepositoryContract & DashboardTrackerRepositoryContract

export class GetAIInsightsUseCase {
  constructor(
    private readonly _dashboardRepository: DashboardInsightRepository,
    private readonly _dashboardInsightGenerator: DashboardInsightGeneratorContract
  ) {}

  async execute(userId: string): Promise<DashboardAIInsightResult> {
    const [streak, trackers, stats] = await Promise.all([
      this._dashboardRepository.getStreakData(userId),
      this._dashboardRepository.getTrackerOverview(userId),
      this._dashboardRepository.getAggregatedStats(userId),
    ])

    const userData = JSON.stringify({
      streak: streak.current,
      longestStreak: streak.longest,
      activeTrackers: trackers.active,
      completedTrackers: trackers.completed,
      totalTrackers: trackers.total,
      totalSubtopicsCompleted: stats.totalSubtopicsCompleted,
      totalPoints: stats.totalPoints,
      publishedTrackers: stats.publishedTrackers,
    })

    try {
      const insight = await this._dashboardInsightGenerator.generate(userData)
      return { insight }
    } catch {
      throw DashboardApplicationError.insightGenerationFailed()
    }
  }
}
