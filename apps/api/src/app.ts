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

import authRouter from './modules/auth/presentation/auth.routes'
import onboardingRouter from './modules/onboarding/presentation/onboarding.routes'
import trackerRoutes from './modules/trackers/presentation/trackers.routes'
import usersRouter from './modules/users/presentation/users.routes'
import uploadsRouter from './modules/uploads/presentation/uploads.routes'
import settingsRouter from './modules/settings/presentation/settings.routes'
import { securityRoutes } from './modules/security/presentation/security.routes'
import dashboardRoutes from './modules/dashboard/presentation/dashboard.routes'
import moderationAppealRoutes from './modules/moderation-appeals/presentation/moderation-appeal.routes'
import  mockTestsRouter  from './modules/mock-tests/presentation/mock-tests.routes'
import communityRouter from './modules/community/presentation/community.routes'
import leaderBoardRouter from './modules/leaderboard/presentation/leaderboard.routes'
import activityRouter from './modules/activity/activity.routes'


const app = express()

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

initPassport()
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

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// module routers will be registered here later

app.use('/api/security', securityRoutes)
app.use('/api/mock-tests', mockTestsRouter)
app.use('/api/community', communityRouter)
app.use('/api/moderation-appeals', moderationAppealRoutes)
app.use('/api/leaderboard',leaderBoardRouter)
app.use('/api/activity',activityRouter)

app.use(errorHandler)

export default app