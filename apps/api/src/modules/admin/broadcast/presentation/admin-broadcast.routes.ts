import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { requireAdmin } from '../../../../shared/middlewares/admin.middleware';
import type { IAdminBroadcastsUseCase } from '../application/use-cases/admin-broadcasts.usecase';
import { AdminBroadcastController } from './admin-broadcast.controller';
export const createAdminBroadcastRoutes = (useCase: IAdminBroadcastsUseCase) => {
  const router = Router();
  const controller = new AdminBroadcastController(useCase);
  router.use(authenticate, requireAdmin);
  router.get('/', controller.list);
  router.post('/', controller.send);
  return router;
};
