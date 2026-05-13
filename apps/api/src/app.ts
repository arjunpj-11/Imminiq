import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env'
import { errorHandler } from './shared/middlewares/errorHandler'
import cookieParser from 'cookie-parser'
import passport from 'passport'
import { initPassport } from './infrastructure/auth/passport'


import authRouter from './modules/auth/auth.routes'
import onboardingRouter from './modules/onboarding/onboarding.routes'

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

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

// module routers will be registered here later

app.use(errorHandler)

export default app