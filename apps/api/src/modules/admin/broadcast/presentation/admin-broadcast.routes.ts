import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { requireAdmin } from '../../../../shared/middlewares/admin.middleware';
import type { AdminBroadcastUseCases } from '../application/admin-broadcast-use-cases.contract';
import { AdminBroadcastController } from './admin-broadcast.controller';
import { ADMIN_BROADCAST_ROUTE_PATHS } from './admin-broadcast.route.constants';
export const createAdminBroadcastRoutes = (useCases: AdminBroadcastUseCases) => {
  const router = Router();
  const controller = new AdminBroadcastController(useCases);
  router.use(authenticate, requireAdmin);
  router.get(ADMIN_BROADCAST_ROUTE_PATHS.ROOT, controller.list);
  router.post(ADMIN_BROADCAST_ROUTE_PATHS.ROOT, controller.send);
  return router;
};
