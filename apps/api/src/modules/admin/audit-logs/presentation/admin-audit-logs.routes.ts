import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { requireAdmin } from '../../../../shared/middlewares/admin.middleware';
import type { IListAdminAuditLogsUseCase } from '../application/use-cases/list-admin-audit-logs.usecase';
import { AdminAuditLogsController } from './admin-audit-logs.controller';
export const createAdminAuditLogsRoutes = (useCase: IListAdminAuditLogsUseCase) => {
  const router = Router();
  const controller = new AdminAuditLogsController(useCase);
  router.use(authenticate, requireAdmin);
  router.get('/', controller.list);
  return router;
};
