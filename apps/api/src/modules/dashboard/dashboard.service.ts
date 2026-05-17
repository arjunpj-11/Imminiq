import { mongoDashboardRepository } from './infrastructure/repositories/mongo-dashboard.repository'
import { aiDashboardInsightGenerator } from './infrastructure/gateways/ai-dashboard-insight.generator'

import { GetDashboardSummaryUseCase } from './application/use-cases/get-dashboard-summary.usecase'
import { GetCurrentRoadmapUseCase } from './application/use-cases/get-current-roadmap.usecase'
import { GetActivityIntensityUseCase } from './application/use-cases/get-activity-intensity.usecase'
import { GetRecentBattlesUseCase } from './application/use-cases/get-recent-battles.usecase'
import { GetFriendsHubUseCase } from './application/use-cases/get-friends-hub.usecase'
import { GetRecommendedActionsUseCase } from './application/use-cases/get-recommended-actions.usecase'
import { GetAIInsightsUseCase } from './application/use-cases/get-ai-insights.usecase'

const getDashboardSummaryUseCase =
  new GetDashboardSummaryUseCase(mongoDashboardRepository)

const getCurrentRoadmapUseCase =
  new GetCurrentRoadmapUseCase(mongoDashboardRepository)

const getActivityIntensityUseCase =
  new GetActivityIntensityUseCase(mongoDashboardRepository)

const getRecentBattlesUseCase =
  new GetRecentBattlesUseCase(mongoDashboardRepository)

const getFriendsHubUseCase =
  new GetFriendsHubUseCase(mongoDashboardRepository)

const getRecommendedActionsUseCase =
  new GetRecommendedActionsUseCase(mongoDashboardRepository)

const getAIInsightsUseCase =
  new GetAIInsightsUseCase(
    mongoDashboardRepository,
    aiDashboardInsightGenerator
  )

export const dashboardService = {
  getSummary: (userId: string) =>
    getDashboardSummaryUseCase.execute(userId),

  getCurrentRoadmap: (userId: string) =>
    getCurrentRoadmapUseCase.execute(userId),

  getActivityIntensity: (userId: string, months?: number) =>
    getActivityIntensityUseCase.execute(userId, months),

  getRecentBattles: (userId: string, limit?: number) =>
    getRecentBattlesUseCase.execute(userId, limit),

  getFriendsHub: (userId: string, limit?: number) =>
    getFriendsHubUseCase.execute(userId, limit),

  getRecommendedActions: (userId: string) =>
    getRecommendedActionsUseCase.execute(userId),

  getAIInsights: (userId: string) =>
    getAIInsightsUseCase.execute(userId),
}
