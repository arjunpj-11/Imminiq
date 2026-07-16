import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import {
  requireAdminPermission,
  requirePrivilegedMfa,
} from '../../../../shared/middlewares/admin.middleware';
import type { AdminTrackersUseCases } from '../application/admin-trackers-use-cases.contract';
import { AdminTrackersController } from './admin-trackers.controller';
import { ADMIN_TRACKERS_ROUTE_PATHS } from './admin-trackers.route.constants';
import { validateIdentifierParam } from '../../../../shared/middlewares/validate';
export const createAdminTrackersRoutes = (useCases: AdminTrackersUseCases) => {
  const router = Router();
  const controller = new AdminTrackersController(useCases);
  router.use(authenticate, requireAdminPermission('content:read'));
  router.param('id', validateIdentifierParam);
  router.param('reportId', validateIdentifierParam);
  router.get(ADMIN_TRACKERS_ROUTE_PATHS.ROOT, controller.list);
  router.get(ADMIN_TRACKERS_ROUTE_PATHS.PUBLISHED, controller.listPublished);
  router.get(ADMIN_TRACKERS_ROUTE_PATHS.REPORTS, controller.listReports);
  router.patch(
    ADMIN_TRACKERS_ROUTE_PATHS.REPORT_DETAIL,
    requireAdminPermission('content:moderate'),
    controller.updateReport
  );
  router.post(ADMIN_TRACKERS_ROUTE_PATHS.PUBLISHED_LIKE, controller.likePublished);
  router.put(ADMIN_TRACKERS_ROUTE_PATHS.PUBLISHED_RATING, controller.ratePublished);
  router.get(ADMIN_TRACKERS_ROUTE_PATHS.DETAIL, controller.getDetail);
  router.patch(
    ADMIN_TRACKERS_ROUTE_PATHS.LIFECYCLE,
    requireAdminPermission('content:delete'),
    requirePrivilegedMfa,
    controller.updateLifecycle
  );
  return router;
};
