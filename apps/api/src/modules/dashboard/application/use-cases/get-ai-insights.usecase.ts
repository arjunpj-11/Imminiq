import type { DashboardRepository } from '../../domain/repositories/dashboard.repository.interface'
import type { DashboardInsightGenerator } from '../../domain/services/dashboard-insight-generator.interface'

export class GetAIInsightsUseCase {
  constructor(
    private readonly dashboardRepository: DashboardRepository,
    private readonly dashboardInsightGenerator: DashboardInsightGenerator
  ) {}

  async execute(userId: string): Promise<{ insight: string }> {
    const [streak, trackers, stats] = await Promise.all([
      this.dashboardRepository.getStreakData(userId),
      this.dashboardRepository.getTrackerOverview(userId),
      this.dashboardRepository.getAggregatedStats(userId),
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
      const insight = await this.dashboardInsightGenerator.generate(userData)

      return { insight }
    } catch {
      return {
        insight: `You have a ${streak.current}-day streak going. Keep it up by studying at least one subtopic today.`,
      }
    }
  }
}
