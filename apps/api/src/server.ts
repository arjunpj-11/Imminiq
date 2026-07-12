import http from 'http'
import app from './app'
import { connectDB } from './config/database'
import { redis } from './config/redis'
import { initSocket } from './infrastructure/realtime/socket'
import { env } from './config/env'
import { disconnectDB } from './config/database'
import { closeSocket } from './infrastructure/realtime/socket'

// Start BullMQ workers
import { aiWorker, startAiWorker } from './infrastructure/queue/workers/ai.worker'

const httpServer = http.createServer(app)
initSocket(httpServer)

const start = async () => {
  await connectDB()
  await redis.ping()
  await startAiWorker()

  httpServer.listen(env.PORT, () => {
    console.log(`🚀 Server running on port ${env.PORT}`)
  })
}

let shuttingDown = false

const shutdown = async (signal: string) => {
  if (shuttingDown) return
  shuttingDown = true
  console.log(`${signal} received; starting graceful shutdown`)

  const forceExit = setTimeout(() => {
    console.error('Graceful shutdown timed out')
    process.exit(1)
  }, env.SHUTDOWN_TIMEOUT_MS)
  forceExit.unref()

  try {
    await closeSocket()
    // Socket.IO closes the HTTP server it is attached to. Only close it here
    // when it is still listening (for example, if Socket.IO was not active).
    if (httpServer.listening) {
      await new Promise<void>((resolve, reject) => {
        httpServer.close((error) => error ? reject(error) : resolve())
      })
    }
    await aiWorker.close()
    await redis.quit()
    await disconnectDB()
    clearTimeout(forceExit)
    process.exit(0)
  } catch (error) {
    console.error('Graceful shutdown failed', error)
    process.exit(1)
  }
}

process.once('SIGTERM', () => void shutdown('SIGTERM'))
process.once('SIGINT', () => void shutdown('SIGINT'))

void start().catch((error) => {
  console.error('API startup failed', error)
  process.exit(1)
})
