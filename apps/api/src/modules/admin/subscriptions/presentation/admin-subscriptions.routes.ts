import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { requireAdmin } from '../../../../shared/middlewares/admin.middleware';
import type { IAdminSubscriptionsUseCase } from '../application/admin-subscriptions.usecase';
import { AdminSubscriptionsController } from './admin-subscriptions.controller';

export const createAdminSubscriptionsRoutes = (useCase: IAdminSubscriptionsUseCase) => {
  const router = Router();
  const controller = new AdminSubscriptionsController(useCase);
  router.use(authenticate, requireAdmin);
  router.get('/', controller.overview);
  router.put('/plans/:planId/limits', controller.updatePlanLimits);
  return router;
};
