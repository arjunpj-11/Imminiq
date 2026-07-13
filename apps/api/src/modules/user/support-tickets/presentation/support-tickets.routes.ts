import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import type { ICreateSupportTicketUseCase } from '../application/use-cases/create-support-ticket.usecase';
import { SupportTicketsController } from './support-tickets.controller';
export const createSupportTicketsRoutes = (useCase: ICreateSupportTicketUseCase) => {
  const router = Router();
  const controller = new SupportTicketsController(useCase);
  router.use(authenticate);
  router.post('/', controller.create);
  return router;
};
