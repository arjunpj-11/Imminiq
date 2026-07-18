import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { requireAdmin } from '../../../../shared/middlewares/admin.middleware';
import type { PrivilegedAdminMiddleware } from '../../../../shared/middlewares/admin.middleware';
import type { AdminSubscriptionsUseCases } from '../application/admin-subscriptions-use-cases.contract';
import { AdminSubscriptionsController } from './admin-subscriptions.controller';
import { ADMIN_SUBSCRIPTIONS_ROUTE_PATHS } from './admin-subscriptions.route.constants';

export const createAdminSubscriptionsRoutes = (
  useCases: AdminSubscriptionsUseCases,
  requirePrivilegedMfa: PrivilegedAdminMiddleware
) => {
  const router = Router();
  const controller = new AdminSubscriptionsController(useCases);
  router.use(authenticate, requireAdmin);
  router.get(ADMIN_SUBSCRIPTIONS_ROUTE_PATHS.ROOT, controller.overview);
  router.put(ADMIN_SUBSCRIPTIONS_ROUTE_PATHS.PLAN, requirePrivilegedMfa, controller.updatePlan);
  return router;
};
