import {
  DashboardMapper,
  type DashboardMapperContract,
} from './application/mappers/dashboard.mapper'
import { GetActivityIntensityUseCase } from './application/use-cases/get-activity-intensity.usecase'
import { GetAIInsightsUseCase } from './application/use-cases/get-ai-insights.usecase'
import { GetCurrentRoadmapUseCase } from './application/use-cases/get-current-roadmap.usecase'
import { GetDashboardSummaryUseCase } from './application/use-cases/get-dashboard-summary.usecase'
import { GetFriendsHubUseCase } from './application/use-cases/get-friends-hub.usecase'
import { GetRecentBattlesUseCase } from './application/use-cases/get-recent-battles.usecase'
import { GetRecommendedActionsUseCase } from './application/use-cases/get-recommended-actions.usecase'
import type { DashboardInsightGeneratorContract } from './domain/services/dashboard-insight-generator.interface'
import { aiDashboardInsightGenerator } from './infrastructure/gateways/ai-dashboard-insight.gateway'
import { mongoDashboardRepository } from './infrastructure/repositories/mongo-dashboard.repository'

export type DashboardUseCases = {
  getDashboardSummary: GetDashboardSummaryUseCase
  getCurrentRoadmap: GetCurrentRoadmapUseCase
  getActivityIntensity: GetActivityIntensityUseCase
  getRecentBattles: GetRecentBattlesUseCase
  getFriendsHub: GetFriendsHubUseCase
  getRecommendedActions: GetRecommendedActionsUseCase
  getAIInsights: GetAIInsightsUseCase
}

export type DashboardServiceHelpers = {
  dashboardMapper: DashboardMapperContract
  dashboardInsightGenerator: DashboardInsightGeneratorContract
}

export type DashboardComposition = {
  useCases: DashboardUseCases
  helpers: DashboardServiceHelpers
}

export const createDashboardComposition = (): DashboardComposition => {
  const dashboardRepository = mongoDashboardRepository
  const dashboardInsightGenerator = aiDashboardInsightGenerator
  const dashboardMapper = new DashboardMapper()

  return {
    useCases: {
      getDashboardSummary: new GetDashboardSummaryUseCase(
        dashboardRepository,
        dashboardMapper
      ),

      getCurrentRoadmap: new GetCurrentRoadmapUseCase(
        dashboardRepository,
        dashboardMapper
      ),

      getActivityIntensity: new GetActivityIntensityUseCase(
        dashboardRepository,
        dashboardMapper
      ),

      getRecentBattles: new GetRecentBattlesUseCase(
        dashboardRepository,
        dashboardMapper
      ),

      getFriendsHub: new GetFriendsHubUseCase(
        dashboardRepository,
        dashboardMapper
      ),

      getRecommendedActions: new GetRecommendedActionsUseCase(
        dashboardRepository,
        dashboardMapper
      ),

      getAIInsights: new GetAIInsightsUseCase(
        dashboardRepository,
        dashboardInsightGenerator
      ),
    },

    helpers: {
      dashboardMapper,
      dashboardInsightGenerator,
    },
  }
}