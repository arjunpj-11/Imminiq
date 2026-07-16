import type { NextFunction, Request, Response } from 'express';
import type { AdminUsersUseCases } from '../application/admin-users-use-cases.contract';
import {
  adminUserMessageSchema,
  adminUserStatusSchema,
  adminUserAppealsQuerySchema,
  adminUserAppealUpdateSchema,
  adminUsersQuerySchema,
  adminUserRoleSchema,
} from './admin-users.schema';
import { sendAdminResult } from '../../shared/presentation';

type UserIdParams = { userId: string };
type AppealIdParams = { appealId: string };
type SessionParams = { userId: string; sessionId: string };

export class AdminUsersController {
  constructor(private readonly _useCases: AdminUsersUseCases) {}
  list = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this._useCases.list.execute(adminUsersQuerySchema.parse(req.query)),
      res,
      'Users fetched'
    );

  listAppeals = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this._useCases.listAppeals.execute(adminUserAppealsQuerySchema.parse(req.query)),
      res,
      'User appeals fetched'
    );

  updateAppeal = (req: Request<AppealIdParams>, res: Response, next: NextFunction) => {
    const payload = adminUserAppealUpdateSchema.parse(req.body);
    const actor = req.user!;
    return sendAdminResult(
      next,
      () =>
        this._useCases.updateAppeal.execute(
          req.params.appealId,
          { status: payload.status, reviewNote: payload.reviewNote },
          { userId: actor.userId },
          {
            ipAddress: req.ip ?? '',
            userAgent: req.get('user-agent') ?? '',
            notifyEmail: payload.notifyEmail,
          }
        ),
      res,
      `Appeal updated to ${payload.status}`
    );
  };

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
          {
            userId: actor.userId,
            role: actor.role as 'admin' | 'superadmin',
          },
          {
            ipAddress: req.ip ?? '',
            userAgent: req.get('user-agent') ?? '',
            reason: payload.reason,
            reasonCode: payload.reasonCode,
            notifyEmail: payload.notifyEmail,
          }
        ),
      res,
      `User status updated to ${payload.status}`
    );
  };

  sendMessage = (req: Request<UserIdParams>, res: Response, next: NextFunction) => {
    const payload = adminUserMessageSchema.parse(req.body);
    const actor = req.user!;
    return sendAdminResult(
      next,
      () =>
        this._useCases.sendMessage.execute(
          req.params.userId,
          payload,
          { userId: actor.userId, role: actor.role as 'admin' | 'superadmin' },
          { ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' }
        ),
      res,
      'Message sent to user'
    );
  };

  revokeSession = (req: Request<SessionParams>, res: Response, next: NextFunction) => {
    const actor = req.user!;
    return sendAdminResult(
      next,
      () =>
        this._useCases.revokeSession.execute(
          req.params.userId,
          req.params.sessionId,
          {
            userId: actor.userId,
            role: actor.role as 'admin' | 'superadmin',
            ipAddress: req.ip ?? '',
            userAgent: req.get('user-agent') ?? '',
          },
          { ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' }
        ),
      res,
      'Session revoked'
    );
  };
  updateRole = (req: Request<UserIdParams>, res: Response, next: NextFunction) => {
    const input = adminUserRoleSchema.parse(req.body);
    const actor = req.user!;
    return sendAdminResult(
      next,
      () =>
        this._useCases.updateRole.execute(
          req.params.userId,
          input.role,
          input.reason,
          { userId: actor.userId, role: 'superadmin' },
          { ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' }
        ),
      res,
      'User role updated'
    );
  };
}
