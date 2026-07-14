import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { requireAdmin } from '../../../../shared/middlewares/admin.middleware';
import type { AdminBroadcastUseCases } from '../application/admin-broadcast-use-cases.contract';
import { AdminBroadcastController } from './admin-broadcast.controller';
export const createAdminBroadcastRoutes = (useCases: AdminBroadcastUseCases) => {
  const router = Router();
  const controller = new AdminBroadcastController(useCases);
  router.use(authenticate, requireAdmin);
  router.get('/', controller.list);
  router.post('/', controller.send);
  return router;
};
