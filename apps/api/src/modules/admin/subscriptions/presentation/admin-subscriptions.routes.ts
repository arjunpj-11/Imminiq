import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { requireAdmin } from '../../../../shared/middlewares/admin.middleware';
import type { AdminSubscriptionsUseCases } from '../application/admin-subscriptions-use-cases.contract';
import { AdminSubscriptionsController } from './admin-subscriptions.controller';

export const createAdminSubscriptionsRoutes = (useCases: AdminSubscriptionsUseCases) => {
  const router = Router();
  const controller = new AdminSubscriptionsController(useCases);
  router.use(authenticate, requireAdmin);
  router.get('/', controller.overview);
  router.put('/plans/:planId/limits', controller.updatePlanLimits);
  return router;
};
