import type * as Application from './index';
export type DashboardUseCases = {
  getDashboardSummary: Application.IGetDashboardSummaryUseCase;
  getCurrentRoadmap: Application.IGetCurrentRoadmapUseCase;
  getActivityIntensity: Application.IGetActivityIntensityUseCase;
  getRecentBattles: Application.IGetRecentBattlesUseCase;
  getFriendsHub: Application.IGetFriendsHubUseCase;
  getRecommendedActions: Application.IGetRecommendedActionsUseCase;
  getAIInsights: Application.IGetAIInsightsUseCase;
};
