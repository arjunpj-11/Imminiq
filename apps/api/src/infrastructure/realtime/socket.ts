import { Server } from 'socket.io'
import { Server as HttpServer } from 'http'
import { env } from '../../config/env'

let io: Server

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: { origin: env.CLIENT_URL, credentials: true },
  })

  io.use((socket, next) => {
    // token auth middleware for socket connections goes here
    next()
  })

  console.log('✅ Socket.io ready')
  return io
}

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized')
  return io
}