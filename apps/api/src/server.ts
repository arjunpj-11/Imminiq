import http from 'http'
import app from './app'
import { connectDB } from './config/database'
import { redis } from './config/redis'
import { initSocket } from './infrastructure/realtime/socket'
import { env } from './config/env'

const httpServer = http.createServer(app)
initSocket(httpServer)

const start = async () => {
  await connectDB()
  await redis.ping()
  httpServer.listen(env.PORT, () => {
    console.log(`🚀 Server running on port ${env.PORT}`)
  })
}

start()