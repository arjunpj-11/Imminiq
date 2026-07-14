import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { requireAdmin } from '../../../../shared/middlewares/admin.middleware';
import type { AdminAuditLogsUseCases } from '../application/admin-audit-logs-use-cases.contract';
import { AdminAuditLogsController } from './admin-audit-logs.controller';
export const createAdminAuditLogsRoutes = (useCases: AdminAuditLogsUseCases) => {
  const router = Router();
  const controller = new AdminAuditLogsController(useCases);
  router.use(authenticate, requireAdmin);
  router.get('/', controller.list);
  return router;
};
