import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../../config/env'
import { ApiError } from '../utils/ApiError'

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) throw new ApiError(401, 'No token provided', 'UNAUTHORIZED')

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; role: string }
    req.user = decoded
    next()
  } catch {
    throw new ApiError(401, 'Invalid or expired token', 'UNAUTHORIZED')
  }
}