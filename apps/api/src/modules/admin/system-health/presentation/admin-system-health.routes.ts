import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { requireAdmin } from '../../../../shared/middlewares/admin.middleware';
import type { AdminSystemHealthUseCases } from '../application/admin-system-health-use-cases.contract';
import { AdminSystemHealthController } from './admin-system-health.controller';
export const createAdminSystemHealthRoutes = (useCases: AdminSystemHealthUseCases) => {
  const router = Router();
  const controller = new AdminSystemHealthController(useCases);
  router.use(authenticate, requireAdmin);
  router.get('/', controller.get);
  return router;
};
