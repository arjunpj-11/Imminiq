import { Request, Response, NextFunction } from 'express'
import { ApiError } from '../utils/ApiError'

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!['admin', 'superadmin'].includes(req.user?.role)) {
    throw new ApiError(403, 'Admin access required', 'FORBIDDEN')
  }
  next()
}