import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { requireAdmin } from '../../../../shared/middlewares/admin.middleware';
import type { AdminSettingsUseCases } from '../application/admin-settings-use-cases.contract';
import { AdminSettingsController } from './admin-settings.controller';
export const createAdminSettingsRoutes = (useCases: AdminSettingsUseCases) => {
  const router = Router();
  const controller = new AdminSettingsController(useCases);
  router.use(authenticate, requireAdmin);
  router.get('/', controller.get);
  router.put('/', controller.update);
  return router;
};
