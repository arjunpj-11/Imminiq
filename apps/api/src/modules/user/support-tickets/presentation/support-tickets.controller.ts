import type { NextFunction, Request, Response } from 'express';
import { ApiResponse } from '../../../../shared/utils/api-response';
import type { SupportTicketsUseCases } from '../application/support-tickets-use-cases.contract';
import { createSupportTicketSchema } from './support-tickets.schema';
export class SupportTicketsController {
  constructor(private readonly _useCases: SupportTicketsUseCases) {}
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.createTicket.execute(
        req.user!.userId,
        createSupportTicketSchema.parse(req.body)
      );
      res.status(201).json(new ApiResponse('Support ticket created', data));
    } catch (error) {
      next(error);
    }
  };
}
