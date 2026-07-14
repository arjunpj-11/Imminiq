import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { rateLimit } from 'express-rate-limit';

import { env } from './config/env';
import { apiNotFoundHandler, errorHandler } from './shared/middlewares/errorHandler';
import { ApiError } from './shared/utils/ApiError';
import { verifyBrowserRequestOrigin } from './shared/middlewares/request-origin.middleware';
import { validateCsrfToken } from './shared/middlewares/csrf-token.middleware';
import { initPassport } from './infrastructure/auth/passport';

import { createAuthComposition, createAuthRoutes } from './modules/auth';
import { createTrackerComposition, createTrackerRoutes } from './modules/user/trackers';
import { createUsersComposition, createUsersRoutes } from './modules/user/users';
import { createUploadsComposition, createUploadsRoutes } from './modules/uploads';
import { settingsRoutes } from './modules/user/settings';
import { securityRoutes } from './modules/security';
import { dashboardRoutes } from './modules/user/dashboard';
import { moderationAppealRoutes } from './modules/user/moderation-appeals';
import { createMockTestsComposition, createMockTestsRoutes } from './modules/user/mock-tests';
import { createCommunityComposition, createCommunityRoutes } from './modules/user/community';
import { leaderboardRoutes } from './modules/user/leaderboard';
import { createActivityComposition, createActivityRoutes } from './modules/user/activity';
import { friendsRoutes } from './modules/user/friends';
import {
  createAdminDashboardComposition,
  createAdminDashboardRoutes,
} from './modules/admin/dashboard';
import { createAdminUsersComposition, createAdminUsersRoutes } from './modules/admin/users';
import {
  createAdminTrackersComposition,
  createAdminTrackersRoutes,
} from './modules/admin/trackers';
import {
  createAdminMockTestsComposition,
  createAdminMockTestsRoutes,
} from './modules/admin/mock-tests';
import {
  createAdminTrackerReviewsComposition,
  createAdminTrackerReviewsRoutes,
} from './modules/admin/tracker-reviews';
import {
  createAdminAnalyticsComposition,
  createAdminAnalyticsRoutes,
} from './modules/admin/analytics';
import {
  createAdminBroadcastComposition,
  createAdminBroadcastRoutes,
} from './modules/admin/broadcast';
import {
  createAdminAuditLogsComposition,
  createAdminAuditLogsRoutes,
} from './modules/admin/audit-logs';
import {
  createAdminSystemHealthComposition,
  createAdminSystemHealthRoutes,
} from './modules/admin/system-health';
import {
  createAdminSupportTicketsComposition,
  createAdminSupportTicketsRoutes,
} from './modules/admin/support-tickets';
import {
  createAdminSettingsComposition,
  createAdminSettingsRoutes,
} from './modules/admin/settings';
import {
  createAdminSubscriptionsComposition,
  createAdminSubscriptionsRoutes,
} from './modules/admin/subscriptions';
import {
  createAdminAITokenSpendComposition,
  createAdminAITokenSpendRoutes,
} from './modules/admin/ai-token-spend';
import {
  createSubscriptionsComposition,
  createSubscriptionsRoutes,
} from './modules/user/subscriptions';
import {
  createSupportTicketsComposition,
  createSupportTicketsRoutes,
} from './modules/user/support-tickets';
import { createNotificationsComposition, createNotificationsRoutes } from './modules/notifications';
import {
  createAdaptiveAssessmentCompletionObserver,
  createAdaptiveLearningComposition,
  createAdaptiveLearningRoutes,
} from './modules/user/adaptive-learning';
import { onboardingRoutes } from './modules/user/onboarding';
import mongoose from 'mongoose';
import { redis } from './config/redis';
import { API_ROUTE_PATHS } from './shared/constants/api-route-paths';

const app = express();

const authComposition = createAuthComposition();
const activityComposition = createActivityComposition();
const usersComposition = createUsersComposition();
const activityRecorder = activityComposition.useCases.recordActivity;

const authRouter = createAuthRoutes(authComposition.useCases);
const activityRouter = createActivityRoutes(activityComposition.useCases);
const usersRouter = createUsersRoutes(usersComposition.useCases);
const uploadsRouter = createUploadsRoutes(
  createUploadsComposition(usersComposition.useCases.getMe).useCases
);
const trackerRoutes = createTrackerRoutes(createTrackerComposition(activityRecorder).useCases);
const communityRouter = createCommunityRoutes(
  createCommunityComposition(activityRecorder).useCases
);
const adaptiveCompletionObserver = createAdaptiveAssessmentCompletionObserver();
const mockTestsComposition = createMockTestsComposition(
  activityRecorder,
  adaptiveCompletionObserver
);
const mockTestsRouter = createMockTestsRoutes(mockTestsComposition.useCases);
const adaptiveLearningRouter = createAdaptiveLearningRoutes(
  createAdaptiveLearningComposition().useCases
);

const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new ApiError(429, 'Too many requests. Please wait a moment and try again.', 'GLOBAL_RATE_LIMITED'));
  },
});

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(globalApiLimiter);
app.use(verifyBrowserRequestOrigin);
app.use(validateCsrfToken);

initPassport(authComposition.helpers.authRepository);
app.use(passport.initialize());

app.use(API_ROUTE_PATHS.auth, authRouter);
app.use(API_ROUTE_PATHS.onboarding, onboardingRoutes);
app.use(API_ROUTE_PATHS.trackers, trackerRoutes);

/* Profile & account routes */
app.use(API_ROUTE_PATHS.users, usersRouter);

/* Avatar and banner upload routes */
app.use(API_ROUTE_PATHS.uploads, uploadsRouter);

/* User settings routes */
app.use(API_ROUTE_PATHS.settings, settingsRoutes);
app.use(
  API_ROUTE_PATHS.subscriptions,
  createSubscriptionsRoutes(createSubscriptionsComposition().useCases)
);

app.use(API_ROUTE_PATHS.dashboard, dashboardRoutes);
app.use(
  API_ROUTE_PATHS.admin.dashboard,
  createAdminDashboardRoutes(createAdminDashboardComposition().useCases)
);
app.use(API_ROUTE_PATHS.admin.users, createAdminUsersRoutes(createAdminUsersComposition().useCases));
app.use(
  API_ROUTE_PATHS.admin.trackers,
  createAdminTrackersRoutes(createAdminTrackersComposition().useCases)
);
app.use(
  API_ROUTE_PATHS.admin.mockTests,
  createAdminMockTestsRoutes(createAdminMockTestsComposition().useCases)
);
app.use(
  API_ROUTE_PATHS.admin.trackerReviews,
  createAdminTrackerReviewsRoutes(createAdminTrackerReviewsComposition().useCases)
);
app.use(
  API_ROUTE_PATHS.admin.analytics,
  createAdminAnalyticsRoutes(createAdminAnalyticsComposition().useCases)
);
app.use(
  API_ROUTE_PATHS.admin.broadcasts,
  createAdminBroadcastRoutes(createAdminBroadcastComposition().useCases)
);
app.use(
  API_ROUTE_PATHS.admin.auditLogs,
  createAdminAuditLogsRoutes(createAdminAuditLogsComposition().useCases)
);
app.use(
  API_ROUTE_PATHS.admin.systemHealth,
  createAdminSystemHealthRoutes(createAdminSystemHealthComposition().useCases)
);
app.use(
  API_ROUTE_PATHS.admin.supportTickets,
  createAdminSupportTicketsRoutes(createAdminSupportTicketsComposition().useCases)
);
app.use(
  API_ROUTE_PATHS.admin.settings,
  createAdminSettingsRoutes(createAdminSettingsComposition().useCases)
);
app.use(
  API_ROUTE_PATHS.admin.subscriptions,
  createAdminSubscriptionsRoutes(createAdminSubscriptionsComposition().useCases)
);
app.use(
  API_ROUTE_PATHS.admin.aiTokenSpend,
  createAdminAITokenSpendRoutes(createAdminAITokenSpendComposition().useCases)
);
app.use(
  API_ROUTE_PATHS.supportTickets,
  createSupportTicketsRoutes(createSupportTicketsComposition().useCases)
);

app.get(API_ROUTE_PATHS.healthLive, (_req, res) => {
  res.json({ status: 'ok', uptimeSeconds: Math.floor(process.uptime()) });
});

app.get(API_ROUTE_PATHS.healthReady, async (_req, res) => {
  const mongoReady = mongoose.connection.readyState === 1;
  let redisReady: boolean;

  try {
    redisReady = (await redis.ping()) === 'PONG';
  } catch {
    redisReady = false;
  }

  const ready = mongoReady && redisReady;
  res.status(ready ? 200 : 503).json({
    status: ready ? 'ready' : 'not_ready',
    dependencies: { mongo: mongoReady, redis: redisReady },
  });
});

app.get(API_ROUTE_PATHS.health, (_req, res) => {
  res.json({ status: 'ok', uptimeSeconds: Math.floor(process.uptime()) });
});

// module routers will be registered here later

app.use(API_ROUTE_PATHS.security, securityRoutes);
app.use(API_ROUTE_PATHS.mockTests, mockTestsRouter);
app.use(API_ROUTE_PATHS.adaptiveLearning, adaptiveLearningRouter);
app.use(API_ROUTE_PATHS.community, communityRouter);
app.use(API_ROUTE_PATHS.moderationAppeals, moderationAppealRoutes);
app.use(API_ROUTE_PATHS.leaderboard, leaderboardRoutes);
app.use(API_ROUTE_PATHS.activity, activityRouter);
app.use(API_ROUTE_PATHS.friends, friendsRoutes);
app.use(
  API_ROUTE_PATHS.notifications,
  createNotificationsRoutes(createNotificationsComposition().useCases)
);

app.use(apiNotFoundHandler);
app.use(errorHandler);

export default app;
