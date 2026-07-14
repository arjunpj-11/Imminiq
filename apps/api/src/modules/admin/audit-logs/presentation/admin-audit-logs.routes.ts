import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { requireAdmin } from '../../../../shared/middlewares/admin.middleware';
import type { AdminAuditLogsUseCases } from '../application/admin-audit-logs-use-cases.contract';
import { AdminAuditLogsController } from './admin-audit-logs.controller';
import { ADMIN_AUDIT_LOGS_ROUTE_PATHS } from './admin-audit-logs.route.constants';
export const createAdminAuditLogsRoutes = (useCases: AdminAuditLogsUseCases) => {
  const router = Router();
  const controller = new AdminAuditLogsController(useCases);
  router.use(authenticate, requireAdmin);
  router.get(ADMIN_AUDIT_LOGS_ROUTE_PATHS.ROOT, controller.list);
  return router;
};
