import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { requireAdmin } from '../../../../shared/middlewares/admin.middleware';
import type { AdminAnalyticsUseCases } from '../application/admin-analytics-use-cases.contract';
import { AdminAnalyticsController } from './admin-analytics.controller';
import { ADMIN_ANALYTICS_ROUTE_PATHS } from './admin-analytics.route.constants';
export const createAdminAnalyticsRoutes = (useCases: AdminAnalyticsUseCases) => {
  const router = Router();
  const controller = new AdminAnalyticsController(useCases);
  router.use(authenticate, requireAdmin);
  router.get(ADMIN_ANALYTICS_ROUTE_PATHS.ROOT, controller.get);
  return router;
};
