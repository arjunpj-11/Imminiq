import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { requireAdmin } from '../../../../shared/middlewares/admin.middleware';
import type { AdminSupportTicketsUseCases } from '../application/admin-support-tickets-use-cases.contract';
import { AdminSupportTicketsController } from './admin-support-tickets.controller';
import { ADMIN_SUPPORT_TICKETS_ROUTE_PATHS } from './admin-support-tickets.route.constants';
export const createAdminSupportTicketsRoutes = (useCases: AdminSupportTicketsUseCases) => {
  const router = Router();
  const controller = new AdminSupportTicketsController(useCases);
  router.use(authenticate, requireAdmin);
  router.get(ADMIN_SUPPORT_TICKETS_ROUTE_PATHS.ROOT, controller.list);
  router.patch(ADMIN_SUPPORT_TICKETS_ROUTE_PATHS.DETAIL, controller.update);
  return router;
};
