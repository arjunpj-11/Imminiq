import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { requireAdmin } from '../../../../shared/middlewares/admin.middleware';
import type { AdminSupportTicketsUseCases } from '../application/admin-support-tickets-use-cases.contract';
import { AdminSupportTicketsController } from './admin-support-tickets.controller';
export const createAdminSupportTicketsRoutes = (useCases: AdminSupportTicketsUseCases) => {
  const router = Router();
  const controller = new AdminSupportTicketsController(useCases);
  router.use(authenticate, requireAdmin);
  router.get('/', controller.list);
  router.patch('/:id', controller.update);
  return router;
};
