import { Server } from 'socket.io'
import { Server as HttpServer } from 'http'
import { env } from '../../config/env'
import jwt from 'jsonwebtoken'

type SocketAccessToken = {
  userId: string
  role: 'user' | 'admin' | 'moderator' | 'superadmin'
  type: 'access'
}

let io: Server

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: { origin: env.CLIENT_URL, credentials: true },
  })

  io.use((socket, next) => {
    const token = typeof socket.handshake.auth?.token === 'string'
      ? socket.handshake.auth.token
      : ''

    try {
      const payload = jwt.verify(token, env.JWT_SECRET, {
        algorithms: ['HS256'],
        issuer: 'imminiq-api',
        audience: 'imminiq-web',
      }) as Partial<SocketAccessToken>

      if (
        payload.type !== 'access' ||
        typeof payload.userId !== 'string' ||
        !['user', 'admin', 'moderator', 'superadmin'].includes(payload.role ?? '')
      ) {
        throw new Error('Invalid socket token')
      }

      socket.data.user = {
        userId: payload.userId,
        role: payload.role,
      }
      next()
    } catch {
      next(new Error('Unauthorized'))
    }
  })

  console.log('✅ Socket.io ready')
  return io
}

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized')
  return io
}
