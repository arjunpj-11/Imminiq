import type { DashboardAIInsightResult } from './application/dtos/dashboard.dto'
import { DashboardMapper, type DashboardMapperContract } from './application/mappers/dashboard.mapper'
import { GetActivityIntensityUseCase } from './application/use-cases/get-activity-intensity.usecase'
import { GetAIInsightsUseCase } from './application/use-cases/get-ai-insights.usecase'
import { GetCurrentRoadmapUseCase } from './application/use-cases/get-current-roadmap.usecase'
import { GetDashboardSummaryUseCase } from './application/use-cases/get-dashboard-summary.usecase'
import { GetFriendsHubUseCase } from './application/use-cases/get-friends-hub.usecase'
import { GetRecentBattlesUseCase } from './application/use-cases/get-recent-battles.usecase'
import { GetRecommendedActionsUseCase } from './application/use-cases/get-recommended-actions.usecase'
import type { DashboardRepositoryContract } from './domain/repositories/dashboard.repository.interface'
import type { DashboardInsightGeneratorContract } from './domain/services/dashboard-insight-generator.interface'
import { aiDashboardInsightGenerator } from './infrastructure/gateways/ai-dashboard-insight.gateway'
import { mongoDashboardRepository } from './infrastructure/repositories/mongo-dashboard.repository'

export class DashboardService {
  private readonly getDashboardSummaryUseCase: GetDashboardSummaryUseCase
  private readonly getCurrentRoadmapUseCase: GetCurrentRoadmapUseCase
  private readonly getActivityIntensityUseCase: GetActivityIntensityUseCase
  private readonly getRecentBattlesUseCase: GetRecentBattlesUseCase
  private readonly getFriendsHubUseCase: GetFriendsHubUseCase
  private readonly getRecommendedActionsUseCase: GetRecommendedActionsUseCase
  private readonly getAIInsightsUseCase: GetAIInsightsUseCase

  constructor(
    dashboardRepository: DashboardRepositoryContract,
    dashboardInsightGenerator: DashboardInsightGeneratorContract,
    dashboardMapper: DashboardMapperContract
  ) {
    this.getDashboardSummaryUseCase = new GetDashboardSummaryUseCase(
      dashboardRepository,
      dashboardMapper
    )
    this.getCurrentRoadmapUseCase = new GetCurrentRoadmapUseCase(
      dashboardRepository,
      dashboardMapper
    )
    this.getActivityIntensityUseCase = new GetActivityIntensityUseCase(
      dashboardRepository,
      dashboardMapper
    )
    this.getRecentBattlesUseCase = new GetRecentBattlesUseCase(
      dashboardRepository,
      dashboardMapper
    )
    this.getFriendsHubUseCase = new GetFriendsHubUseCase(
      dashboardRepository,
      dashboardMapper
    )
    this.getRecommendedActionsUseCase = new GetRecommendedActionsUseCase(
      dashboardRepository,
      dashboardMapper
    )
    this.getAIInsightsUseCase = new GetAIInsightsUseCase(
      dashboardRepository,
      dashboardInsightGenerator
    )
  }

  getSummary(userId: string) {
    return this.getDashboardSummaryUseCase.execute(userId)
  }

  getCurrentRoadmap(userId: string) {
    return this.getCurrentRoadmapUseCase.execute(userId)
  }

  getActivityIntensity(userId: string, months?: number) {
    return this.getActivityIntensityUseCase.execute(userId, months)
  }

  getRecentBattles(userId: string, limit?: number) {
    return this.getRecentBattlesUseCase.execute(userId, limit)
  }

  getFriendsHub(userId: string, limit?: number) {
    return this.getFriendsHubUseCase.execute(userId, limit)
  }

  getRecommendedActions(userId: string) {
    return this.getRecommendedActionsUseCase.execute(userId)
  }

  getAIInsights(userId: string): Promise<DashboardAIInsightResult> {
    return this.getAIInsightsUseCase.execute(userId)
  }
}

// ─── Instantiate application components ────────────────────────────────────

const dashboardRepository = mongoDashboardRepository
const dashboardInsightGenerator = aiDashboardInsightGenerator
const dashboardMapper = new DashboardMapper()

// ─── Service singleton ──────────────────────────────────────────────────────

export const dashboardService = new DashboardService(
  dashboardRepository,
  dashboardInsightGenerator,
  dashboardMapper
)
