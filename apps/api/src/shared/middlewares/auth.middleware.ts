import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../../config/env'
import { ApiError } from '../utils/ApiError'

type UserRole = 'user' | 'admin' | 'moderator' | 'superadmin'

type AuthTokenPayload = {
  userId: string
  role: UserRole
  type?: 'access' | 'refresh'
}

const isUserRole = (role: unknown): role is UserRole => {
  return (
    typeof role === 'string' &&
    ['user', 'admin', 'moderator', 'superadmin'].includes(role)
  )
}

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    throw new ApiError(401, 'No token provided', 'UNAUTHORIZED')
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as Partial<AuthTokenPayload>

    if (!decoded.userId || !isUserRole(decoded.role)) {
      throw new ApiError(401, 'Invalid token payload', 'UNAUTHORIZED')
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      type: decoded.type,
    }

    next()
  } catch {
    throw new ApiError(401, 'Invalid or expired token', 'UNAUTHORIZED')
  }
}