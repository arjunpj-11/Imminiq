export type {
  DashboardActivityIntensityItemDTO,
  DashboardActiveTrackerDTO,
  DashboardAIInsightResultDTO,
  DashboardBattleItemDTO,
  DashboardFriendItemDTO,
  DashboardNotificationMetaDTO,
  DashboardRecentActivityDTO,
  DashboardRecommendedActionDTO,
  DashboardStatsDTO,
  DashboardStreakSummaryDTO,
  DashboardSummaryDTO,
  DashboardTrackerSummaryDTO,
  DashboardUserSummaryDTO,
} from './application/dashboard.dto';

export type {
  DashboardBattleResult,
  DashboardIntensityLevel,
  DashboardRecommendedActionType,
} from './domain/dashboard.types';

export { createDashboardComposition } from './dashboard.factory';
export { createDashboardRoutes } from './presentation/dashboard.routes';
