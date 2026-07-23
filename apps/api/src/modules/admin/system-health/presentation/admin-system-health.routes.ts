import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import {
  requireAdmin,
  type PrivilegedAdminMiddleware,
} from '../../../../shared/middlewares/admin.middleware';
import type { AdminSystemHealthUseCases } from '../application/admin-system-health-use-cases.contract';
import { AdminSystemHealthController } from './admin-system-health.controller';
import { ADMIN_SYSTEM_HEALTH_ROUTE_PATHS } from './admin-system-health.route.constants';
export const createAdminSystemHealthRoutes = (
  useCases: AdminSystemHealthUseCases,
  requirePrivilegedMfa: PrivilegedAdminMiddleware
) => {
  const router = Router();
  const controller = new AdminSystemHealthController(useCases);
  router.use(authenticate, requireAdmin);
  router.get(ADMIN_SYSTEM_HEALTH_ROUTE_PATHS.ROOT, controller.get);
  router.get(ADMIN_SYSTEM_HEALTH_ROUTE_PATHS.JOBS, controller.listJobs);
  router.patch(
    ADMIN_SYSTEM_HEALTH_ROUTE_PATHS.JOB_ACTION,
    requirePrivilegedMfa,
    controller.actOnJob
  );
  return router;
};
