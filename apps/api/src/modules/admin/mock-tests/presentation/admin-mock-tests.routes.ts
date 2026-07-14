import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { requireAdmin } from '../../../../shared/middlewares/admin.middleware';
import type { AdminMockTestsUseCases } from '../application/admin-mock-tests-use-cases.contract';
import { AdminMockTestsController } from './admin-mock-tests.controller';
import { ADMIN_MOCK_TESTS_ROUTE_PATHS } from './admin-mock-tests.route.constants';
export const createAdminMockTestsRoutes = (useCases: AdminMockTestsUseCases) => {
  const router = Router();
  const controller = new AdminMockTestsController(useCases);
  router.use(authenticate, requireAdmin);
  router.get(ADMIN_MOCK_TESTS_ROUTE_PATHS.ROOT, controller.list);
  router.get(ADMIN_MOCK_TESTS_ROUTE_PATHS.DETAIL, controller.getDetail);
  return router;
};
