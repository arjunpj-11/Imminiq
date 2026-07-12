import type * as Application from '../index'
export type DashboardUseCases = {
  getDashboardSummary: Application.GetDashboardSummaryUseCase
  getCurrentRoadmap: Application.GetCurrentRoadmapUseCase
  getActivityIntensity: Application.GetActivityIntensityUseCase
  getRecentBattles: Application.GetRecentBattlesUseCase
  getFriendsHub: Application.GetFriendsHubUseCase
  getRecommendedActions: Application.GetRecommendedActionsUseCase
  getAIInsights: Application.GetAIInsightsUseCase
}
