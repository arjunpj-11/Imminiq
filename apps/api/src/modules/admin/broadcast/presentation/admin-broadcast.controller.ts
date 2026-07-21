import type { NextFunction, Request, Response } from 'express';
import { getAdminActor, sendAdminResult } from '../../../../shared/admin';
import type { AdminBroadcastUseCases } from '../application/admin-broadcast-use-cases.contract';
import { adminBroadcastSchema, adminBroadcastsQuerySchema } from './admin-broadcast.schema';
export class AdminBroadcastController {
  constructor(private readonly _useCases: AdminBroadcastUseCases) {}
  list = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this._useCases.list.execute(adminBroadcastsQuerySchema.parse(req.query)),
      res,
      'Broadcasts fetched'
    );
  send = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this._useCases.send.execute(adminBroadcastSchema.parse(req.body), getAdminActor(req)),
      res,
      'Broadcast sent'
    );
}
