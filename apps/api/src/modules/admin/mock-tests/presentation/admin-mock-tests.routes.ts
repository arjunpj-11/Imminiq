import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import {
  requireAdminPermission,
} from '../../../../shared/middlewares/admin.middleware';
import type { PrivilegedAdminMiddleware } from '../../../../shared/middlewares/admin.middleware';
import { validateIdentifierParam } from '../../../../shared/middlewares/validate';
import type { AdminMockTestsUseCases } from '../application/admin-mock-tests-use-cases.contract';
import { AdminMockTestsController } from './admin-mock-tests.controller';
import { ADMIN_MOCK_TESTS_ROUTE_PATHS } from './admin-mock-tests.route.constants';
export const createAdminMockTestsRoutes = (
  useCases: AdminMockTestsUseCases,
  requirePrivilegedMfa: PrivilegedAdminMiddleware
) => {
  const router = Router();
  const controller = new AdminMockTestsController(useCases);
  router.use(authenticate, requireAdminPermission('content:read'));
  router.param('id', validateIdentifierParam);
  router.param('issueId', validateIdentifierParam);
  router.param('questionId', validateIdentifierParam);
  router.param('appealId', validateIdentifierParam);
  router.get(ADMIN_MOCK_TESTS_ROUTE_PATHS.ROOT, controller.list);
  router.get(ADMIN_MOCK_TESTS_ROUTE_PATHS.EXPORT, controller.exportCsv);
  router.post(ADMIN_MOCK_TESTS_ROUTE_PATHS.BULK_LIFECYCLE, requireAdminPermission('content:delete'), requirePrivilegedMfa, controller.bulkLifecycle);
  router.get(ADMIN_MOCK_TESTS_ROUTE_PATHS.ISSUES, controller.listQuestionIssues);
  router.get(ADMIN_MOCK_TESTS_ROUTE_PATHS.APPEALS, controller.listAppeals);
  router.patch(ADMIN_MOCK_TESTS_ROUTE_PATHS.APPEAL_DETAIL, requireAdminPermission('content:moderate'), requirePrivilegedMfa, controller.updateAppeal);
  router.patch(
    ADMIN_MOCK_TESTS_ROUTE_PATHS.ISSUE_DETAIL,
    requireAdminPermission('content:moderate'),
    requirePrivilegedMfa,
    controller.updateQuestionIssue
  );
  router.get(
    ADMIN_MOCK_TESTS_ROUTE_PATHS.QUESTION_VERSIONS,
    requireAdminPermission('content:read'),
    controller.listQuestionVersions
  );
  router.post(
    ADMIN_MOCK_TESTS_ROUTE_PATHS.QUESTION_VERSION_RESTORE,
    requireAdminPermission('content:moderate'),
    requirePrivilegedMfa,
    controller.restoreQuestionVersion
  );
  router.patch(
    ADMIN_MOCK_TESTS_ROUTE_PATHS.LIFECYCLE,
    requireAdminPermission('content:delete'),
    requirePrivilegedMfa,
    controller.updateLifecycle
  );
  router.get(ADMIN_MOCK_TESTS_ROUTE_PATHS.DETAIL, controller.getDetail);
  return router;
};
