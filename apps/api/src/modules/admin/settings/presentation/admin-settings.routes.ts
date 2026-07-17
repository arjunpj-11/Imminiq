import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { requireAdmin, requirePrivilegedMfa } from '../../../../shared/middlewares/admin.middleware';
import type { AdminSettingsUseCases } from '../application/admin-settings-use-cases.contract';
import { AdminSettingsController } from './admin-settings.controller';
import { ADMIN_SETTINGS_ROUTE_PATHS } from './admin-settings.route.constants';
export const createAdminSettingsRoutes = (useCases: AdminSettingsUseCases) => {
  const router = Router();
  const controller = new AdminSettingsController(useCases);
  router.use(authenticate, requireAdmin);
  router.get(ADMIN_SETTINGS_ROUTE_PATHS.ROOT, controller.get);
  router.put(ADMIN_SETTINGS_ROUTE_PATHS.ROOT, requirePrivilegedMfa, controller.update);
  return router;
};
