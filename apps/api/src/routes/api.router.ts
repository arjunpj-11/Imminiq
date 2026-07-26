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
import { createChatComposition, createChatRoutes } from '../modules/user/chat';
import { createCallsComposition, createCallsRoutes } from '../modules/user/calls';
import { createVoiceInputComposition, createVoiceInputRoutes } from '../modules/user/voice-input';
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
import { createRequireEnabledFeature } from '../shared/middlewares/feature-availability.middleware';
import { mongoPlatformPolicyReader } from '../infrastructure/mongo-platform-policy.reader';
import { ApiResponse } from '../shared/utils/api-response';
import { z } from 'zod';

const clientErrorSchema = z
  .object({
    source: z.enum(['render', 'widget', 'window', 'unhandled-rejection', 'invariant']),
    message: z.string().trim().min(1).max(500),
    stack: z.string().max(3_000).optional(),
    componentStack: z.string().max(2_000).optional(),
    path: z.string().startsWith('/').max(500),
    occurredAt: z.string().datetime(),
  })
  .strict();

export const createApiRouter = () => {
  const router = Router();
  const requireFeature = (
    feature: Parameters<typeof createRequireEnabledFeature>[1],
    label: string
  ) => createRequireEnabledFeature(mongoPlatformPolicyReader, feature, label);

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
  const chatComposition = createChatComposition();
  const callsComposition = createCallsComposition();
  const voiceInputComposition = createVoiceInputComposition();
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
  const adminTrackersComposition = createAdminTrackersComposition(
    communityComposition.helpers.verificationRewards
  );
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
  router.post(API_ROUTE_PATHS.clientErrors, (req, res, next) => {
    try {
      const event = clientErrorSchema.parse(req.body);
      console.error(
        JSON.stringify({
          level: 'error',
          event: 'client_error',
          ...event,
        })
      );
      res.status(202).end();
    } catch (error) {
      next(error);
    }
  });
  router.get(API_ROUTE_PATHS.featureAvailability, authenticate, async (_req, res, next) => {
    try {
      const features = await mongoPlatformPolicyReader.getFeaturePolicy();
      res.setHeader('Cache-Control', 'private, no-store');
      res.json(new ApiResponse('Feature availability fetched', features));
    } catch (error) {
      next(error);
    }
  });
  const trackerCreationRoutes = createTrackerCreationRoutes(
    trackerCreationComposition.useCases,
    enforcePlanLimit
  );
  router.use(
    `${API_ROUTE_PATHS.trackers}/create`,
    requireFeature('trackers', 'Trackers'),
    requireFeature('trackerCreation', 'Tracker creation'),
    trackerCreationRoutes
  );
  // Compatibility for already released clients. The feature now belongs to trackers.
  router.use(
    API_ROUTE_PATHS.legacyOnboarding,
    requireFeature('trackers', 'Trackers'),
    requireFeature('trackerCreation', 'Tracker creation'),
    createTrackerCreationRoutes(trackerCreationComposition.useCases, enforcePlanLimit)
  );
  router.use(
    API_ROUTE_PATHS.trackers,
    requireFeature('trackers', 'Trackers'),
    createTrackerRoutes(
      trackerComposition.useCases,
      enforcePlanLimit,
      requireFeature('trackerCreation', 'Tracker creation')
    )
  );
  router.use(API_ROUTE_PATHS.users, createUsersRoutes(usersComposition.useCases));
  router.use(API_ROUTE_PATHS.uploads, createUploadsRoutes(uploadsComposition.useCases));
  router.use(API_ROUTE_PATHS.settings, createSettingsRoutes(settingsComposition.useCases));
  router.use(
    API_ROUTE_PATHS.subscriptions,
    requireFeature('subscriptions', 'Subscriptions'),
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
    requireFeature('supportTickets', 'Support tickets'),
    createSupportTicketsRoutes(supportTicketsComposition.useCases)
  );
  router.use(API_ROUTE_PATHS.security, createSecurityRoutes(securityComposition.useCases));
  router.use(
    API_ROUTE_PATHS.mockTests,
    requireFeature('mockTests', 'Mock tests'),
    createMockTestsRoutes(mockTestsComposition.useCases, enforcePlanLimit)
  );
  router.use(
    API_ROUTE_PATHS.adaptiveLearning,
    requireFeature('adaptiveLearning', 'Adaptive learning'),
    createAdaptiveLearningRoutes(adaptiveLearningComposition.useCases)
  );
  router.use(
    API_ROUTE_PATHS.community,
    requireFeature('community', 'Community'),
    createCommunityRoutes(
      communityComposition.useCases,
      enforcePlanLimit,
      requireFeature('trackerCreation', 'Tracker creation')
    )
  );
  router.use(
    API_ROUTE_PATHS.moderationAppeals,
    createModerationAppealRoutes(moderationAppealComposition.useCases)
  );
  router.use(
    API_ROUTE_PATHS.leaderboard,
    requireFeature('leaderboard', 'Leaderboard'),
    createLeaderboardRoutes(leaderboardComposition.useCases)
  );
  router.use(
    API_ROUTE_PATHS.activity,
    requireFeature('activity', 'Activity'),
    createActivityRoutes(activityComposition.useCases)
  );
  router.use(
    API_ROUTE_PATHS.friends,
    requireFeature('social', 'Social features'),
    createFriendsRoutes(friendsComposition.useCases)
  );
  router.use(
    API_ROUTE_PATHS.chat,
    requireFeature('social', 'Social features'),
    createChatRoutes(chatComposition.useCases)
  );
  router.use(
    API_ROUTE_PATHS.calls,
    requireFeature('social', 'Social features'),
    requireFeature('calls', 'Voice and video calls'),
    createCallsRoutes(callsComposition.useCases)
  );
  router.use(
    API_ROUTE_PATHS.voiceInput,
    requireFeature('adaptiveLearning', 'Adaptive learning'),
    createVoiceInputRoutes(voiceInputComposition.useCases)
  );
  router.use(
    API_ROUTE_PATHS.notifications,
    createNotificationsRoutes(notificationsComposition.useCases)
  );

  return { router, authRepository: authComposition.helpers.authRepository };
};
