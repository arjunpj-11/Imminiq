import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import {
  requireAdminPermission,
} from '../../../../shared/middlewares/admin.middleware';
import type { PrivilegedAdminMiddleware } from '../../../../shared/middlewares/admin.middleware';
import type { AdminTrackersUseCases } from '../application/admin-trackers-use-cases.contract';
import { AdminTrackersController } from './admin-trackers.controller';
import { ADMIN_TRACKERS_ROUTE_PATHS } from './admin-trackers.route.constants';
import { validateIdentifierParam } from '../../../../shared/middlewares/validate';
export const createAdminTrackersRoutes = (
  useCases: AdminTrackersUseCases,
  requirePrivilegedMfa: PrivilegedAdminMiddleware
) => {
  const router = Router();
  const controller = new AdminTrackersController(useCases);
  router.use(authenticate, requireAdminPermission('content:read'));
  router.param('id', validateIdentifierParam);
  router.param('reportId', validateIdentifierParam);
  router.param('reviewId', validateIdentifierParam);
  router.param('appealId', validateIdentifierParam);
  router.get(ADMIN_TRACKERS_ROUTE_PATHS.ROOT, controller.list);
  router.get(ADMIN_TRACKERS_ROUTE_PATHS.EXPORT, controller.exportCsv);
  router.post(ADMIN_TRACKERS_ROUTE_PATHS.BULK_LIFECYCLE, requireAdminPermission('content:delete'), requirePrivilegedMfa, controller.bulkLifecycle);
  router.get(ADMIN_TRACKERS_ROUTE_PATHS.PUBLISHED, controller.listPublished);
  router.get(ADMIN_TRACKERS_ROUTE_PATHS.REPORTS, controller.listReports);
  router.get(ADMIN_TRACKERS_ROUTE_PATHS.APPEALS, controller.listAppeals);
  router.patch(ADMIN_TRACKERS_ROUTE_PATHS.APPEAL_DETAIL, requireAdminPermission('content:moderate'), requirePrivilegedMfa, controller.updateAppeal);
  router.get(ADMIN_TRACKERS_ROUTE_PATHS.REVIEWS, controller.listReviews);
  router.patch(
    ADMIN_TRACKERS_ROUTE_PATHS.REVIEW_CONSENSUS,
    requireAdminPermission('content:moderate'),
    requirePrivilegedMfa,
    controller.addReviewConsensus
  );
  router.patch(
    ADMIN_TRACKERS_ROUTE_PATHS.REVIEW_STATUS,
    requireAdminPermission('content:moderate'),
    requirePrivilegedMfa,
    controller.resolveReview
  );
  router.patch(
    ADMIN_TRACKERS_ROUTE_PATHS.REPORT_DETAIL,
    requireAdminPermission('content:moderate'),
    requirePrivilegedMfa,
    controller.updateReport
  );
  router.post(ADMIN_TRACKERS_ROUTE_PATHS.PUBLISHED_LIKE, controller.likePublished);
  router.put(ADMIN_TRACKERS_ROUTE_PATHS.PUBLISHED_RATING, controller.ratePublished);
  router.get(ADMIN_TRACKERS_ROUTE_PATHS.DETAIL, controller.getDetail);
  router.get(ADMIN_TRACKERS_ROUTE_PATHS.VERSIONS, controller.listVersions);
  router.post(ADMIN_TRACKERS_ROUTE_PATHS.VERSION_RESTORE, requireAdminPermission('content:moderate'), requirePrivilegedMfa, controller.restoreVersion);
  router.patch(
    ADMIN_TRACKERS_ROUTE_PATHS.LIFECYCLE,
    requireAdminPermission('content:delete'),
    requirePrivilegedMfa,
    controller.updateLifecycle
  );
  return router;
};
