import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import type { SupportTicketsUseCases } from '../application/support-tickets-use-cases.contract';
import { SupportTicketsController } from './support-tickets.controller';
import { SUPPORT_TICKET_ROUTE_PATHS } from './support-tickets.route.constants';
export const createSupportTicketsRoutes = (useCases: SupportTicketsUseCases) => {
  const router = Router();
  const controller = new SupportTicketsController(useCases);
  router.use(authenticate);
  router.post(SUPPORT_TICKET_ROUTE_PATHS.ROOT, controller.create);
  return router;
};
