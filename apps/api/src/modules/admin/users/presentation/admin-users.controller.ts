import type { NextFunction, Request, Response } from 'express';
import type { AdminUsersUseCases } from '../application/admin-users-use-cases.contract';
import { adminUserStatusSchema, adminUsersQuerySchema } from './admin-users.schema';
import { sendAdminResult } from '../../shared/presentation';

type UserIdParams = { userId: string };

export class AdminUsersController {
  constructor(private readonly _useCases: AdminUsersUseCases) {}
  list = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this._useCases.list.execute(adminUsersQuerySchema.parse(req.query)),
      res,
      'Users fetched'
    );

  getDetail = (req: Request<UserIdParams>, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this._useCases.getDetail.execute(req.params.userId),
      res,
      'User detail fetched'
    );

  setStatus = (req: Request<UserIdParams>, res: Response, next: NextFunction) => {
    const payload = adminUserStatusSchema.parse(req.body);
    const actor = req.user!;
    return sendAdminResult(
      next,
      () =>
        this._useCases.setStatus.execute(
          req.params.userId,
          payload.status,
          { userId: actor.userId, role: actor.role as 'admin' | 'superadmin' },
          {
            ipAddress: req.ip ?? '',
            userAgent: req.get('user-agent') ?? '',
            ...(payload.reason ? { reason: payload.reason } : {}),
          }
        ),
      res,
      `User ${payload.status === 'blocked' ? 'blocked' : 'unblocked'}`
    );
  };
}
