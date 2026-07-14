import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { requireAdmin } from '../../../../shared/middlewares/admin.middleware';
import type { AdminMockTestsUseCases } from '../application/admin-mock-tests-use-cases.contract';
import { AdminMockTestsController } from './admin-mock-tests.controller';
export const createAdminMockTestsRoutes = (useCases: AdminMockTestsUseCases) => {
  const router = Router();
  const controller = new AdminMockTestsController(useCases);
  router.use(authenticate, requireAdmin);
  router.get('/', controller.list);
  router.get('/:id', controller.getDetail);
  return router;
};
