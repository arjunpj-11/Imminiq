import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import passport from 'passport'
import { rateLimit } from 'express-rate-limit'

import { env } from './config/env'
import { errorHandler } from './shared/middlewares/errorHandler'
import { verifyBrowserRequestOrigin } from './shared/middlewares/request-origin.middleware'
import { validateCsrfToken } from './shared/middlewares/csrf-token.middleware'
import { initPassport } from './infrastructure/auth/passport'

import { createAuthComposition } from './modules/auth/auth.factory'
import { createAuthRoutes } from './modules/auth/presentation/auth.routes'
import onboardingRouter from './modules/user/onboarding/presentation/onboarding.routes'
import { createTrackerComposition } from './modules/user/trackers/tracker.factory'
import { createTrackerRoutes } from './modules/user/trackers/presentation/trackers.routes'
import { createUsersComposition } from './modules/user/users/users.factory'
import { createUsersRoutes } from './modules/user/users/presentation/users.routes'
import { createUploadsComposition } from './modules/uploads/uploads.factory'
import { createUploadsRoutes } from './modules/uploads/presentation/uploads.routes'
import settingsRouter from './modules/user/settings/presentation/settings.routes'
import { securityRoutes } from './modules/security/presentation/security.routes'
import dashboardRoutes from './modules/user/dashboard/presentation/dashboard.routes'
import moderationAppealRoutes from './modules/user/moderation-appeals/presentation/moderation-appeal.routes'
import { createMockTestsComposition } from './modules/user/mock-tests/mock-tests.factory'
import { createMockTestsRoutes } from './modules/user/mock-tests/presentation/mock-tests.routes'
import { createCommunityComposition } from './modules/user/community/community.factory'
import { createCommunityRoutes } from './modules/user/community/presentation/community.routes'
import leaderBoardRouter from './modules/user/leaderboard/presentation/leaderboard.routes'
import { createActivityComposition } from './modules/user/activity/activity.factory'
import { createActivityRoutes } from './modules/user/activity/presentation/activity.routes'
import { friendsRoutes } from './modules/user/friends/presentation/friends.routes'
import { createAdminDashboardComposition, createAdminDashboardRoutes } from './modules/admin/dashboard'
import { createAdminUsersComposition, createAdminUsersRoutes } from './modules/admin/users'
import { createNotificationsComposition, createNotificationsRoutes } from './modules/notifications'
import { createAdaptiveLearningComposition } from './modules/user/adaptive-learning/adaptive-learning.factory'
import { createAdaptiveLearningRoutes } from './modules/user/adaptive-learning/presentation/adaptive-learning.routes'
import {
  AdaptiveAssessmentCompletionObserver,
  mongoAdaptiveLearningRepository,
} from './modules/user/adaptive-learning/infrastructure'
import mongoose from 'mongoose'
import { redis } from './config/redis'


const app = express()

const authComposition = createAuthComposition()
const activityComposition = createActivityComposition()
const usersComposition = createUsersComposition()
const activityRecorder = activityComposition.useCases.recordActivity

const authRouter = createAuthRoutes(authComposition.useCases)
const activityRouter = createActivityRoutes(activityComposition.useCases)
const usersRouter = createUsersRoutes(usersComposition.useCases)
const uploadsRouter = createUploadsRoutes(
  createUploadsComposition(usersComposition.useCases.getMe).useCases,
)
const trackerRoutes = createTrackerRoutes(
  createTrackerComposition(activityRecorder).useCases,
)
const communityRouter = createCommunityRoutes(
  createCommunityComposition(activityRecorder).useCases,
)
const adaptiveCompletionObserver = new AdaptiveAssessmentCompletionObserver(
  mongoAdaptiveLearningRepository,
)
const mockTestsComposition = createMockTestsComposition(
  activityRecorder,
  adaptiveCompletionObserver,
)
const mockTestsRouter = createMockTestsRoutes(mockTestsComposition.useCases)
const adaptiveLearningRouter = createAdaptiveLearningRoutes(
  createAdaptiveLearningComposition().useCases,
)

const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
})

app.use(helmet())
app.use(cors({ origin: env.CLIENT_URL, credentials: true }))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(globalApiLimiter)
app.use(verifyBrowserRequestOrigin)
app.use(validateCsrfToken)

initPassport(authComposition.helpers.authRepository)
app.use(passport.initialize())

app.use('/api/auth', authRouter)
app.use('/api/onboarding', onboardingRouter)
app.use('/api/trackers', trackerRoutes)

/* Profile & account routes */
app.use('/api/users', usersRouter)

/* Avatar and banner upload routes */
app.use('/api/uploads', uploadsRouter)

/* User settings routes */
app.use('/api/settings', settingsRouter)

app.use('/api/dashboard', dashboardRoutes)
app.use('/api/admin/dashboard', createAdminDashboardRoutes(createAdminDashboardComposition().useCases))
app.use('/api/admin/users', createAdminUsersRoutes(createAdminUsersComposition().useCases))

app.get('/api/health/live', (_req, res) => {
  res.json({ status: 'ok', uptimeSeconds: Math.floor(process.uptime()) })
})

app.get('/api/health/ready', async (_req, res) => {
  const mongoReady = mongoose.connection.readyState === 1
  let redisReady: boolean

  try {
    redisReady = (await redis.ping()) === 'PONG'
  } catch {
    redisReady = false
  }

  const ready = mongoReady && redisReady
  res.status(ready ? 200 : 503).json({
    status: ready ? 'ready' : 'not_ready',
    dependencies: { mongo: mongoReady, redis: redisReady },
  })
})

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptimeSeconds: Math.floor(process.uptime()) })
})

// module routers will be registered here later

app.use('/api/security', securityRoutes)
app.use('/api/mock-tests', mockTestsRouter)
app.use('/api/adaptive-learning', adaptiveLearningRouter)
app.use('/api/community', communityRouter)
app.use('/api/moderation-appeals', moderationAppealRoutes)
app.use('/api/leaderboard',leaderBoardRouter)
app.use('/api/activity',activityRouter)
app.use('/api/friends', friendsRoutes)
app.use('/api/notifications', createNotificationsRoutes(createNotificationsComposition().useCases))

app.use(errorHandler)

export default app
