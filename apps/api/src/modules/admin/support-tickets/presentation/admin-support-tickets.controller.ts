import type { NextFunction, Request, Response } from 'express';
import { getAdminActor, sendAdminResult } from '../../../../shared/admin';
import type { AdminSupportTicketsUseCases } from '../application/admin-support-tickets-use-cases.contract';
import {
  adminSupportTicketsQuerySchema,
  adminSupportTicketUpdateSchema,
} from './admin-support-tickets.schema';
export class AdminSupportTicketsController {
  constructor(private readonly useCases: AdminSupportTicketsUseCases) {}
  list = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this.useCases.list.execute(adminSupportTicketsQuerySchema.parse(req.query)),
      res,
      'Support tickets fetched'
    );
  update = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () =>
        this.useCases.update.execute(
          String(req.params.id),
          adminSupportTicketUpdateSchema.parse(req.body),
          getAdminActor(req)
        ),
      res,
      'Support ticket updated'
    );
}
