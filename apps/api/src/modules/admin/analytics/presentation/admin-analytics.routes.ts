import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { requireAdmin } from '../../../../shared/middlewares/admin.middleware';
import type { IGetAdminAnalyticsUseCase } from '../application/use-cases/get-admin-analytics.usecase';
import { AdminAnalyticsController } from './admin-analytics.controller';
export const createAdminAnalyticsRoutes = (useCase: IGetAdminAnalyticsUseCase) => {
  const router = Router();
  const controller = new AdminAnalyticsController(useCase);
  router.use(authenticate, requireAdmin);
  router.get('/', controller.get);
  return router;
};
