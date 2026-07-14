import type { NextFunction, Request, Response } from 'express';
import { ApiResponse } from '../../../../shared/utils/ApiResponse';
import type { ICreateSupportTicketUseCase } from '../application/use-cases/create-support-ticket.usecase';
import { createSupportTicketSchema } from './support-tickets.schema';
export class SupportTicketsController {
  constructor(private readonly createTicket: ICreateSupportTicketUseCase) {}
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.createTicket.execute(
        req.user!.userId,
        createSupportTicketSchema.parse(req.body)
      );
      res.status(201).json(new ApiResponse('Support ticket created', data));
    } catch (error) {
      next(error);
    }
  };
}
