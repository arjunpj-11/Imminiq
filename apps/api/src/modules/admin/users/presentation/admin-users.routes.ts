import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import {
  requireAdminPermission,
  requireSuperAdmin,
} from '../../../../shared/middlewares/admin.middleware';
import type { PrivilegedAdminMiddleware } from '../../../../shared/middlewares/admin.middleware';
import type { AdminUsersUseCases } from '../application/admin-users-use-cases.contract';
import { AdminUsersController } from './admin-users.controller';
import { ADMIN_USERS_ROUTE_PATHS } from './admin-users.route.constants';
import { validateIdentifierParam } from '../../../../shared/middlewares/validate.middleware';

export const createAdminUsersRoutes = (
  useCases: AdminUsersUseCases,
  requirePrivilegedMfa: PrivilegedAdminMiddleware
) => {
  const router = Router();
  const controller = new AdminUsersController(useCases);
  router.use(authenticate, requireAdminPermission('users:manage'));
  router.param('userId', validateIdentifierParam);
  router.param('appealId', validateIdentifierParam);
  router.param('sessionId', validateIdentifierParam);
  router.param('requestId', validateIdentifierParam);
  router.param('noteId', validateIdentifierParam);
  router.get(ADMIN_USERS_ROUTE_PATHS.ROOT, controller.list);
  router.get(ADMIN_USERS_ROUTE_PATHS.EXPORT, controller.exportCsv);
  router.post(ADMIN_USERS_ROUTE_PATHS.BULK_STATUS, requirePrivilegedMfa, controller.bulkStatus);
  router.get(ADMIN_USERS_ROUTE_PATHS.PRIVACY_REQUESTS, controller.listPrivacyRequests);
  router.patch(ADMIN_USERS_ROUTE_PATHS.PRIVACY_REQUEST_DETAIL, requirePrivilegedMfa, controller.updatePrivacyRequest);
  router.get(ADMIN_USERS_ROUTE_PATHS.APPEALS, controller.listAppeals);
  router.patch(
    ADMIN_USERS_ROUTE_PATHS.APPEAL_DETAIL,
    requirePrivilegedMfa,
    controller.updateAppeal
  );
  router.get(ADMIN_USERS_ROUTE_PATHS.DETAIL, controller.getDetail);
  router.get(ADMIN_USERS_ROUTE_PATHS.NOTES, controller.listNotes);
  router.post(ADMIN_USERS_ROUTE_PATHS.NOTES, requirePrivilegedMfa, controller.addNote);
  router.delete(ADMIN_USERS_ROUTE_PATHS.NOTE_DETAIL, requirePrivilegedMfa, controller.removeNote);
  router.put(ADMIN_USERS_ROUTE_PATHS.TAGS, requirePrivilegedMfa, controller.updateTags);
  router.patch(ADMIN_USERS_ROUTE_PATHS.STATUS, requirePrivilegedMfa, controller.setStatus);
  router.post(ADMIN_USERS_ROUTE_PATHS.MESSAGE, requirePrivilegedMfa, controller.sendMessage);
  router.delete(
    ADMIN_USERS_ROUTE_PATHS.SESSION,
    requirePrivilegedMfa,
    controller.revokeSession
  );
  router.patch(
    ADMIN_USERS_ROUTE_PATHS.ROLE,
    requireSuperAdmin,
    requirePrivilegedMfa,
    controller.updateRole
  );
  router.put(
    ADMIN_USERS_ROUTE_PATHS.ACTION_PASSWORD,
    requireSuperAdmin,
    requirePrivilegedMfa,
    controller.setActionPassword
  );
  return router;
};
