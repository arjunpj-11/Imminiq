import type { NextFunction, Request, Response } from 'express';
import { getAdminActor, sendAdminResult } from '../../shared';
import type { IAdminSupportTicketsUseCase } from '../application/use-cases/admin-support-tickets.usecase';
import {
  adminSupportTicketsQuerySchema,
  adminSupportTicketUpdateSchema,
} from './admin-support-tickets.schema';
export class AdminSupportTicketsController {
  constructor(private readonly useCase: IAdminSupportTicketsUseCase) {}
  list = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () => this.useCase.list(adminSupportTicketsQuerySchema.parse(req.query)),
      res,
      'Support tickets fetched'
    );
  update = (req: Request, res: Response, next: NextFunction) =>
    sendAdminResult(
      next,
      () =>
        this.useCase.update(
          String(req.params.id),
          adminSupportTicketUpdateSchema.parse(req.body),
          getAdminActor(req)
        ),
      res,
      'Support ticket updated'
    );
}
