import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import {
  requireAdminPermission,
  requirePrivilegedMfa,
} from '../../../../shared/middlewares/admin.middleware';
import type { AdminUsersUseCases } from '../application/admin-users-use-cases.contract';
import { AdminUsersController } from './admin-users.controller';
import { ADMIN_USERS_ROUTE_PATHS } from './admin-users.route.constants';

export const createAdminUsersRoutes = (useCases: AdminUsersUseCases) => {
  const router = Router();
  const controller = new AdminUsersController(useCases);
  router.use(authenticate, requireAdminPermission('users:manage'));
  router.get(ADMIN_USERS_ROUTE_PATHS.ROOT, controller.list);
  router.get(ADMIN_USERS_ROUTE_PATHS.DETAIL, controller.getDetail);
  router.patch(ADMIN_USERS_ROUTE_PATHS.STATUS, requirePrivilegedMfa, controller.setStatus);
  return router;
};
