 import { Request, Response, NextFunction } from 'express'
import { ApiError } from '../utils/ApiError'

export const requireAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const role = req.user?.role

  if (!role || !['admin', 'superadmin'].includes(role)) {
    throw new ApiError(403, 'Admin access required', 'FORBIDDEN')
  }

  next()
}