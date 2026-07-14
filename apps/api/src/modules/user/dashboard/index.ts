export type {
  IDashboardActivityIntensityItemDTO,
  IDashboardActiveTrackerDTO,
  IDashboardAIInsightResultDTO,
  IDashboardBattleItemDTO,
  IDashboardFriendItemDTO,
  IDashboardNotificationMetaDTO,
  IDashboardRecentActivityDTO,
  IDashboardRecommendedActionDTO,
  IDashboardStatsDTO,
  IDashboardStreakSummaryDTO,
  IDashboardSummaryDTO,
  IDashboardTrackerSummaryDTO,
  IDashboardUserSummaryDTO,
} from './application/dashboard.dto';

export type {
  DashboardBattleResult,
  DashboardIntensityLevel,
  DashboardRecommendedActionType,
} from './domain/dashboard.types';

export { createDashboardComposition } from './dashboard.factory';
export { dashboardRoutes } from './presentation/dashboard.routes';
