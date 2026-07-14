import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { requireAdmin } from '../../../../shared/middlewares/admin.middleware';
import type { AdminAnalyticsUseCases } from '../application/admin-analytics-use-cases.contract';
import { AdminAnalyticsController } from './admin-analytics.controller';
export const createAdminAnalyticsRoutes = (useCases: AdminAnalyticsUseCases) => {
  const router = Router();
  const controller = new AdminAnalyticsController(useCases);
  router.use(authenticate, requireAdmin);
  router.get('/', controller.get);
  return router;
};
