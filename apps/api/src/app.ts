import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import passport from 'passport'

import { env } from './config/env'
import { errorHandler } from './shared/middlewares/errorHandler'
import { initPassport } from './infrastructure/auth/passport'

import authRouter from './modules/auth/auth.routes'
import onboardingRouter from './modules/onboarding/onboarding.routes'
import trackerRoutes from './modules/trackers/trackers.routes'
import usersRouter from './modules/users/users.routes'
import uploadsRouter from './modules/uploads/uploads.routes'
import settingsRouter from './modules/settings/settings.routes'
import { securityRoutes } from './modules/security/security.routes'

const app = express()

app.use(helmet())
app.use(cors({ origin: env.CLIENT_URL, credentials: true }))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

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

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// module routers will be registered here later

app.use('/api/security', securityRoutes)
app.use(errorHandler)

export default app