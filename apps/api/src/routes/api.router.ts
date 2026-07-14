import { Router } from 'express';

import { createAuthComposition, createAuthRoutes } from '../modules/auth';
import { createNotificationsComposition, createNotificationsRoutes } from '../modules/notifications';
import { createUploadsComposition, createUploadsRoutes } from '../modules/uploads';
import {
  createAdminAITokenSpendComposition,
  createAdminAITokenSpendRoutes,
} from '../modules/admin/ai-token-spend';
import {
  createAdminAnalyticsComposition,
  createAdminAnalyticsRoutes,
} from '../modules/admin/analytics';
import {
  createAdminAuditLogsComposition,
  createAdminAuditLogsRoutes,
} from '../modules/admin/audit-logs';
import {
  createAdminBroadcastComposition,
  createAdminBroadcastRoutes,
} from '../modules/admin/broadcast';
import {
  createAdminDashboardComposition,
  createAdminDashboardRoutes,
} from '../modules/admin/dashboard';
import {
  createAdminMockTestsComposition,
  createAdminMockTestsRoutes,
} from '../modules/admin/mock-tests';
import {
  createAdminSettingsComposition,
  createAdminSettingsRoutes,
} from '../modules/admin/settings';
import {
  createAdminSubscriptionsComposition,
  createAdminSubscriptionsRoutes,
} from '../modules/admin/subscriptions';
import {
  createAdminSupportTicketsComposition,
  createAdminSupportTicketsRoutes,
} from '../modules/admin/support-tickets';
import {
  createAdminSystemHealthComposition,
  createAdminSystemHealthRoutes,
} from '../modules/admin/system-health';
import {
  createAdminTrackerReviewsComposition,
  createAdminTrackerReviewsRoutes,
} from '../modules/admin/tracker-reviews';
import {
  createAdminTrackersComposition,
  createAdminTrackersRoutes,
} from '../modules/admin/trackers';
import { createAdminUsersComposition, createAdminUsersRoutes } from '../modules/admin/users';
import {
  createActivityComposition,
  createActivityRoutes,
} from '../modules/user/activity';
import {
  createAdaptiveAssessmentCompletionObserver,
  createAdaptiveLearningComposition,
  createAdaptiveLearningRoutes,
} from '../modules/user/adaptive-learning';
import { createCommunityComposition, createCommunityRoutes } from '../modules/user/community';
import { dashboardRoutes } from '../modules/user/dashboard';
import { friendsRoutes } from '../modules/user/friends';
import { leaderboardRoutes } from '../modules/user/leaderboard';
import {
  createMockTestsComposition,
  createMockTestsRoutes,
} from '../modules/user/mock-tests';
import { moderationAppealRoutes } from '../modules/user/moderation-appeals';
import { onboardingRoutes } from '../modules/user/onboarding';
import { settingsRoutes } from '../modules/user/settings';
import {
  createSubscriptionsComposition,
  createSubscriptionsRoutes,
} from '../modules/user/subscriptions';
import {
  createSupportTicketsComposition,
  createSupportTicketsRoutes,
} from '../modules/user/support-tickets';
import { createTrackerComposition, createTrackerRoutes } from '../modules/user/trackers';
import { createUsersComposition, createUsersRoutes } from '../modules/user/users';
import { securityRoutes } from '../modules/security';
import { API_ROUTE_PATHS } from '../shared/constants/api-route-paths';

/** Builds feature dependencies once and exposes the complete application router. */
export const createApiRouter = () => {
  const router = Router();

  const authComposition = createAuthComposition();
  const activityComposition = createActivityComposition();
  const usersComposition = createUsersComposition();
  const activityRecorder = activityComposition.useCases.recordActivity;
  const adaptiveCompletionObserver = createAdaptiveAssessmentCompletionObserver();

  const authRouter = createAuthRoutes(authComposition.useCases);
  const activityRouter = createActivityRoutes(activityComposition.useCases);
  const usersRouter = createUsersRoutes(usersComposition.useCases);
  const uploadsRouter = createUploadsRoutes(
    createUploadsComposition(usersComposition.useCases.getMe).useCases
  );
  const trackerRouter = createTrackerRoutes(createTrackerComposition(activityRecorder).useCases);
  const communityRouter = createCommunityRoutes(
    createCommunityComposition(activityRecorder).useCases
  );
  const mockTestsRouter = createMockTestsRoutes(
    createMockTestsComposition(activityRecorder, adaptiveCompletionObserver).useCases
  );
  const adaptiveLearningRouter = createAdaptiveLearningRoutes(
    createAdaptiveLearningComposition().useCases
  );

  router.use(API_ROUTE_PATHS.auth, authRouter);
  router.use(API_ROUTE_PATHS.onboarding, onboardingRoutes);
  router.use(API_ROUTE_PATHS.trackers, trackerRouter);
  router.use(API_ROUTE_PATHS.users, usersRouter);
  router.use(API_ROUTE_PATHS.uploads, uploadsRouter);
  router.use(API_ROUTE_PATHS.settings, settingsRoutes);
  router.use(
    API_ROUTE_PATHS.subscriptions,
    createSubscriptionsRoutes(createSubscriptionsComposition().useCases)
  );
  router.use(API_ROUTE_PATHS.dashboard, dashboardRoutes);
  router.use(
    API_ROUTE_PATHS.admin.dashboard,
    createAdminDashboardRoutes(createAdminDashboardComposition().useCases)
  );
  router.use(API_ROUTE_PATHS.admin.users, createAdminUsersRoutes(createAdminUsersComposition().useCases));
  router.use(
    API_ROUTE_PATHS.admin.trackers,
    createAdminTrackersRoutes(createAdminTrackersComposition().useCases)
  );
  router.use(
    API_ROUTE_PATHS.admin.mockTests,
    createAdminMockTestsRoutes(createAdminMockTestsComposition().useCases)
  );
  router.use(
    API_ROUTE_PATHS.admin.trackerReviews,
    createAdminTrackerReviewsRoutes(createAdminTrackerReviewsComposition().useCases)
  );
  router.use(
    API_ROUTE_PATHS.admin.analytics,
    createAdminAnalyticsRoutes(createAdminAnalyticsComposition().useCases)
  );
  router.use(
    API_ROUTE_PATHS.admin.broadcasts,
    createAdminBroadcastRoutes(createAdminBroadcastComposition().useCases)
  );
  router.use(
    API_ROUTE_PATHS.admin.auditLogs,
    createAdminAuditLogsRoutes(createAdminAuditLogsComposition().useCases)
  );
  router.use(
    API_ROUTE_PATHS.admin.systemHealth,
    createAdminSystemHealthRoutes(createAdminSystemHealthComposition().useCases)
  );
  router.use(
    API_ROUTE_PATHS.admin.supportTickets,
    createAdminSupportTicketsRoutes(createAdminSupportTicketsComposition().useCases)
  );
  router.use(
    API_ROUTE_PATHS.admin.settings,
    createAdminSettingsRoutes(createAdminSettingsComposition().useCases)
  );
  router.use(
    API_ROUTE_PATHS.admin.subscriptions,
    createAdminSubscriptionsRoutes(createAdminSubscriptionsComposition().useCases)
  );
  router.use(
    API_ROUTE_PATHS.admin.aiTokenSpend,
    createAdminAITokenSpendRoutes(createAdminAITokenSpendComposition().useCases)
  );
  router.use(
    API_ROUTE_PATHS.supportTickets,
    createSupportTicketsRoutes(createSupportTicketsComposition().useCases)
  );
  router.use(API_ROUTE_PATHS.security, securityRoutes);
  router.use(API_ROUTE_PATHS.mockTests, mockTestsRouter);
  router.use(API_ROUTE_PATHS.adaptiveLearning, adaptiveLearningRouter);
  router.use(API_ROUTE_PATHS.community, communityRouter);
  router.use(API_ROUTE_PATHS.moderationAppeals, moderationAppealRoutes);
  router.use(API_ROUTE_PATHS.leaderboard, leaderboardRoutes);
  router.use(API_ROUTE_PATHS.activity, activityRouter);
  router.use(API_ROUTE_PATHS.friends, friendsRoutes);
  router.use(
    API_ROUTE_PATHS.notifications,
    createNotificationsRoutes(createNotificationsComposition().useCases)
  );

  return { router, authRepository: authComposition.helpers.authRepository };
};
