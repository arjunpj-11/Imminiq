import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env'
import { errorHandler } from './shared/middlewares/errorHandler'

const app = express()

app.use(helmet())
app.use(cors({ origin: env.CLIENT_URL, credentials: true }))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

// module routers will be registered here later

app.use(errorHandler)

export default app