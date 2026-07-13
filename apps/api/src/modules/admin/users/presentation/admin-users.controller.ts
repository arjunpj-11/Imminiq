import type { NextFunction, Request, Response } from 'express'
import type { AdminUsersUseCases } from '../application/admin-users-use-cases.contract'
import { ApiResponse } from '../../../../shared/utils/ApiResponse'
import { adminUserStatusSchema, adminUsersQuerySchema } from './admin-users.schema'

type UserIdParams = { userId: string }

export class AdminUsersController {
  constructor(private readonly _useCases: AdminUsersUseCases) {}
  list = async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(new ApiResponse('Users fetched', await this._useCases.list.execute(adminUsersQuerySchema.parse(req.query)))) } catch (error) { next(error) }
  }
  getDetail = async (req: Request<UserIdParams>, res: Response, next: NextFunction) => {
    try { res.json(new ApiResponse('User detail fetched', await this._useCases.getDetail.execute(req.params.userId))) } catch (error) { next(error) }
  }
  setStatus = async (req: Request<UserIdParams>, res: Response, next: NextFunction) => {
    try {
      const payload = adminUserStatusSchema.parse(req.body)
      const actor = req.user!
      const data = await this._useCases.setStatus.execute(req.params.userId, payload.status, { userId: actor.userId, role: actor.role as 'admin' | 'superadmin' }, { ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '', ...(payload.reason ? { reason: payload.reason } : {}) })
      res.json(new ApiResponse(`User ${payload.status === 'blocked' ? 'blocked' : 'unblocked'}`, data))
    } catch (error) { next(error) }
  }
}
