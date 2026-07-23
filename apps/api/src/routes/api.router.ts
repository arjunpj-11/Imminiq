import { Router } from 'express';

import { createAuthComposition, createAuthRoutes } from '../modules/auth';
import {
  createNotificationsComposition,
  createNotificationsRoutes,
} from '../modules/notifications';
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
  createAdminTrackersComposition,
  createAdminTrackersRoutes,
} from '../modules/admin/trackers';
import { createAdminUsersComposition, createAdminUsersRoutes } from '../modules/admin/users';
import { createActivityComposition, createActivityRoutes } from '../modules/user/activity';
import {
  createAdaptiveAssessmentCompletionObserver,
  createAdaptiveLearningComposition,
  createAdaptiveLearningRoutes,
} from '../modules/user/adaptive-learning';
import { createCommunityComposition, createCommunityRoutes } from '../modules/user/community';
import { createDashboardComposition, createDashboardRoutes } from '../modules/user/dashboard';
import { createFriendsComposition, createFriendsRoutes } from '../modules/user/friends';
import { createLeaderboardComposition, createLeaderboardRoutes } from '../modules/user/leaderboard';
import { createMockTestsComposition, createMockTestsRoutes } from '../modules/user/mock-tests';
import {
  createModerationAppealComposition,
  createModerationAppealRoutes,
} from '../modules/user/moderation-appeals';
import { createSettingsComposition, createSettingsRoutes } from '../modules/user/settings';
import {
  createSubscriptionsComposition,
  createSubscriptionsRoutes,
} from '../modules/user/subscriptions';
import {
  createSupportTicketsComposition,
  createSupportTicketsRoutes,
} from '../modules/user/support-tickets';
import { createTrackerComposition, createTrackerRoutes } from '../modules/user/trackers';
import {
  createTrackerCreationComposition,
  createTrackerCreationRoutes,
} from '../modules/user/tracker-creation';
import { createUsersComposition, createUsersRoutes } from '../modules/user/users';
import { createSecurityComposition, createSecurityRoutes } from '../modules/security';
import { API_ROUTE_PATHS } from '../shared/constants/api-route-paths';
import {
  createRequirePrivilegedMfa,
  requireStaffTwoFactor,
} from '../shared/middlewares/admin.middleware';
import { authenticate } from '../shared/middlewares/auth.middleware';

export const createApiRouter = () => {
  const router = Router();

  // 🔹 Core compositions
  const authComposition = createAuthComposition();
  const activityComposition = createActivityComposition();
  const usersComposition = createUsersComposition();
  const trackerCreationComposition = createTrackerCreationComposition();
  const settingsComposition = createSettingsComposition();
  const securityComposition = createSecurityComposition();
  const requirePrivilegedMfa = createRequirePrivilegedMfa(
    securityComposition.helpers.passwordHasher
  );
  const dashboardComposition = createDashboardComposition();
  const friendsComposition = createFriendsComposition();
  const leaderboardComposition = createLeaderboardComposition();
  const moderationAppealComposition = createModerationAppealComposition();
  const notificationsComposition = createNotificationsComposition();

  // 🔹 Derived dependencies
  const activityRecorder = activityComposition.useCases.recordActivity;
  const adaptiveCompletionObserver = createAdaptiveAssessmentCompletionObserver();

  // 🔹 Feature compositions
  const uploadsComposition = createUploadsComposition(usersComposition.useCases.getMe);
  const communityComposition = createCommunityComposition(activityRecorder);
  const trackerComposition = createTrackerComposition(
    activityRecorder,
    notificationsComposition.useCases.createNotification,
    communityComposition.helpers.personalCloneProvisioner
  );
  const mockTestsComposition = createMockTestsComposition(
    activityRecorder,
    adaptiveCompletionObserver
  );
  const adaptiveLearningComposition = createAdaptiveLearningComposition();
  const subscriptionsComposition = createSubscriptionsComposition();
  const { enforcePlanLimit } = subscriptionsComposition.helpers;
  const supportTicketsComposition = createSupportTicketsComposition();

  // 🔹 Admin compositions
  const adminDashboardComposition = createAdminDashboardComposition();
  const adminUsersComposition = createAdminUsersComposition(
    securityComposition.helpers.passwordHasher
  );
  const adminTrackersComposition = createAdminTrackersComposition();
  const adminMockTestsComposition = createAdminMockTestsComposition();
  const adminAnalyticsComposition = createAdminAnalyticsComposition();
  const adminBroadcastComposition = createAdminBroadcastComposition();
  const adminAuditLogsComposition = createAdminAuditLogsComposition();
  const adminSystemHealthComposition = createAdminSystemHealthComposition();
  const adminSupportTicketsComposition = createAdminSupportTicketsComposition();
  const adminSettingsComposition = createAdminSettingsComposition();
  const adminSubscriptionsComposition = createAdminSubscriptionsComposition(
    subscriptionsComposition.helpers.getDefaultSubscriptionPlan
  );
  const adminAITokenSpendComposition = createAdminAITokenSpendComposition();

  // 🔹 Routers
  router.use(API_ROUTE_PATHS.auth, createAuthRoutes(authComposition.useCases));
  const trackerCreationRoutes = createTrackerCreationRoutes(
    trackerCreationComposition.useCases,
    enforcePlanLimit
  );
  router.use(`${API_ROUTE_PATHS.trackers}/create`, trackerCreationRoutes);
  // Compatibility for already released clients. The feature now belongs to trackers.
  router.use(
    API_ROUTE_PATHS.legacyOnboarding,
    createTrackerCreationRoutes(trackerCreationComposition.useCases, enforcePlanLimit)
  );
  router.use(
    API_ROUTE_PATHS.trackers,
    createTrackerRoutes(trackerComposition.useCases, enforcePlanLimit)
  );
  router.use(API_ROUTE_PATHS.users, createUsersRoutes(usersComposition.useCases));
  router.use(API_ROUTE_PATHS.uploads, createUploadsRoutes(uploadsComposition.useCases));
  router.use(API_ROUTE_PATHS.settings, createSettingsRoutes(settingsComposition.useCases));
  router.use(
    API_ROUTE_PATHS.subscriptions,
    createSubscriptionsRoutes(subscriptionsComposition.useCases)
  );
  router.use(API_ROUTE_PATHS.dashboard, createDashboardRoutes(dashboardComposition.useCases));

  // 🔹 Admin routes
  router.use(API_ROUTE_PATHS.adminRoot, authenticate, requireStaffTwoFactor);
  router.use(
    API_ROUTE_PATHS.admin.dashboard,
    createAdminDashboardRoutes(adminDashboardComposition.useCases)
  );
  router.use(
    API_ROUTE_PATHS.admin.users,
    createAdminUsersRoutes(adminUsersComposition.useCases, requirePrivilegedMfa)
  );
  router.use(
    API_ROUTE_PATHS.admin.trackers,
    createAdminTrackersRoutes(adminTrackersComposition.useCases, requirePrivilegedMfa)
  );
  router.use(
    API_ROUTE_PATHS.admin.mockTests,
    createAdminMockTestsRoutes(adminMockTestsComposition.useCases, requirePrivilegedMfa)
  );
  router.use(
    API_ROUTE_PATHS.admin.analytics,
    createAdminAnalyticsRoutes(adminAnalyticsComposition.useCases)
  );
  router.use(
    API_ROUTE_PATHS.admin.broadcasts,
    createAdminBroadcastRoutes(adminBroadcastComposition.useCases, requirePrivilegedMfa)
  );
  router.use(
    API_ROUTE_PATHS.admin.auditLogs,
    createAdminAuditLogsRoutes(adminAuditLogsComposition.useCases)
  );
  router.use(
    API_ROUTE_PATHS.admin.systemHealth,
    createAdminSystemHealthRoutes(adminSystemHealthComposition.useCases, requirePrivilegedMfa)
  );
  router.use(
    API_ROUTE_PATHS.admin.supportTickets,
    createAdminSupportTicketsRoutes(adminSupportTicketsComposition.useCases, requirePrivilegedMfa)
  );
  router.use(
    API_ROUTE_PATHS.admin.settings,
    createAdminSettingsRoutes(adminSettingsComposition.useCases, requirePrivilegedMfa)
  );
  router.use(
    API_ROUTE_PATHS.admin.subscriptions,
    createAdminSubscriptionsRoutes(adminSubscriptionsComposition.useCases, requirePrivilegedMfa)
  );
  router.use(
    API_ROUTE_PATHS.admin.aiTokenSpend,
    createAdminAITokenSpendRoutes(adminAITokenSpendComposition.useCases)
  );

  // 🔹 User feature routes
  router.use(
    API_ROUTE_PATHS.supportTickets,
    createSupportTicketsRoutes(supportTicketsComposition.useCases)
  );
  router.use(API_ROUTE_PATHS.security, createSecurityRoutes(securityComposition.useCases));
  router.use(
    API_ROUTE_PATHS.mockTests,
    createMockTestsRoutes(mockTestsComposition.useCases, enforcePlanLimit)
  );
  router.use(
    API_ROUTE_PATHS.adaptiveLearning,
    createAdaptiveLearningRoutes(adaptiveLearningComposition.useCases)
  );
  router.use(
    API_ROUTE_PATHS.community,
    createCommunityRoutes(communityComposition.useCases, enforcePlanLimit)
  );
  router.use(
    API_ROUTE_PATHS.moderationAppeals,
    createModerationAppealRoutes(moderationAppealComposition.useCases)
  );
  router.use(API_ROUTE_PATHS.leaderboard, createLeaderboardRoutes(leaderboardComposition.useCases));
  router.use(API_ROUTE_PATHS.activity, createActivityRoutes(activityComposition.useCases));
  router.use(API_ROUTE_PATHS.friends, createFriendsRoutes(friendsComposition.useCases));
  router.use(
    API_ROUTE_PATHS.notifications,
    createNotificationsRoutes(notificationsComposition.useCases)
  );

  return { router, authRepository: authComposition.helpers.authRepository };
};
