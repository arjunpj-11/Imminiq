import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { requireAdminPermission } from '../../../../shared/middlewares/admin.middleware';
import type { AdminTrackerReviewsUseCases } from '../application/admin-tracker-reviews-use-cases.contract';
import { AdminTrackerReviewsController } from './admin-tracker-reviews.controller';
import { ADMIN_TRACKER_REVIEWS_ROUTE_PATHS } from './admin-tracker-reviews.route.constants';
export const createAdminTrackerReviewsRoutes = (useCases: AdminTrackerReviewsUseCases) => {
  const router = Router();
  const controller = new AdminTrackerReviewsController(useCases);
  router.use(authenticate, requireAdminPermission('content:read'));
  router.get(ADMIN_TRACKER_REVIEWS_ROUTE_PATHS.ROOT, controller.list);
  router.patch(
    ADMIN_TRACKER_REVIEWS_ROUTE_PATHS.CONSENSUS,
    requireAdminPermission('content:moderate'),
    controller.addConsensusVote
  );
  router.patch(
    ADMIN_TRACKER_REVIEWS_ROUTE_PATHS.STATUS,
    requireAdminPermission('content:moderate'),
    controller.resolve
  );
  return router;
};
