import type { NextFunction, Request, Response } from 'express';
import type { AdminUsersUseCases } from '../application/admin-users-use-cases.contract';
import {
  adminUserMessageSchema,
  adminUserStatusSchema,
  adminUserAppealsQuerySchema,
  adminUserAppealUpdateSchema,
  adminUsersQuerySchema,
  adminUserRoleSchema,
  adminPrivacyRequestsQuerySchema,
  adminPrivacyRequestUpdateSchema,
  adminUserNoteSchema,
  adminUserTagsSchema,
  adminUserBulkStatusSchema,
  adminActionPasswordSchema,
} from './admin-users.schema';
import { getAdminActor, sendAdminResult } from '../../../../shared/admin';

type UserIdParams = { userId: string };
type AppealIdParams = { appealId: string };
type SessionParams = { userId: string; sessionId: string };

export class AdminUsersController {
  constructor(private readonly _useCases: AdminUsersUseCases) {}
  listNotes = (req: Request<UserIdParams>, res: Response, next: NextFunction) => sendAdminResult(next, () => this._useCases.notes.list(req.params.userId), res, 'User notes fetched');
  addNote = (req: Request<UserIdParams>, res: Response, next: NextFunction) => sendAdminResult(next, () => this._useCases.notes.add(req.params.userId, adminUserNoteSchema.parse(req.body), { userId: req.user!.userId, role: req.user!.role as 'admin' | 'superadmin', ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' }), res, 'User note added');
  removeNote = (req: Request<{ userId: string; noteId: string }>, res: Response, next: NextFunction) => sendAdminResult(next, () => this._useCases.notes.remove(req.params.userId, req.params.noteId, { userId: req.user!.userId, role: req.user!.role as 'admin' | 'superadmin', ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' }), res, 'User note removed');
  updateTags = (req: Request<UserIdParams>, res: Response, next: NextFunction) => sendAdminResult(next, () => this._useCases.notes.updateTags(req.params.userId, adminUserTagsSchema.parse(req.body).tags, { userId: req.user!.userId, role: req.user!.role as 'admin' | 'superadmin', ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' }), res, 'User tags updated');
  exportCsv = async (req: Request, res: Response, next: NextFunction) => {
    try { const query = adminUsersQuerySchema.parse(req.query); const content = await this._useCases.exports.users(query); res.setHeader('Content-Type', 'text/csv; charset=utf-8'); res.setHeader('Content-Disposition', 'attachment; filename="imminiq-users.csv"'); res.send(`\uFEFF${content}`); } catch (error) { next(error); }
  };
  bulkStatus = (req: Request, res: Response, next: NextFunction) => {
    const actor = getAdminActor(req);
    const input = adminUserBulkStatusSchema.parse(req.body);
    return sendAdminResult(
      next,
      () =>
        this._useCases.bulkSetStatus.execute(
          input,
          { userId: actor.userId, role: actor.role as 'admin' | 'superadmin' },
          { ipAddress: actor.ipAddress, userAgent: actor.userAgent }
      ),
      res,
      input.preview ? 'Bulk action preview' : 'Bulk user action completed'
    );
  };
  listPrivacyRequests = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(next, () => this._useCases.privacyRequests.list(adminPrivacyRequestsQuerySchema.parse(req.query)), res, 'Privacy requests fetched');

  updatePrivacyRequest = (req: Request<{ requestId: string }>, res: Response, next: NextFunction) => {
    const actor = req.user!;
    return sendAdminResult(next, () => this._useCases.privacyRequests.update(
      req.params.requestId,
      adminPrivacyRequestUpdateSchema.parse(req.body),
      { userId: actor.userId, role: actor.role as 'admin' | 'superadmin', ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' }
    ), res, 'Privacy request updated');
  };
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
  setActionPassword = (req: Request<UserIdParams>, res: Response, next: NextFunction) => {
    const input = adminActionPasswordSchema.parse(req.body);
    return sendAdminResult(
      next,
      () =>
        this._useCases.setActionPassword.execute(
          req.params.userId,
          input.password,
          req.user!.userId,
          { ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' }
        ),
      res,
      'Admin action password set'
    );
  };
}
