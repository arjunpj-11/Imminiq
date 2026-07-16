import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { requireAdminPermission } from '../../../../shared/middlewares/admin.middleware';
import type { AdminDashboardUseCases } from '../application/admin-dashboard-use-cases.contract';
import { AdminDashboardController } from './admin-dashboard.controller';
import { ADMIN_DASHBOARD_ROUTE_PATHS } from './admin-dashboard.route.constants';

export const createAdminDashboardRoutes = (useCases: AdminDashboardUseCases) => {
  const router = Router();
  const controller = new AdminDashboardController(useCases);
  router.use(authenticate, requireAdminPermission('content:read'));
  router.get(ADMIN_DASHBOARD_ROUTE_PATHS.ROOT, controller.getOverview);
  return router;
};
