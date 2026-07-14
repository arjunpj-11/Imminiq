import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { requireAdmin } from '../../../../shared/middlewares/admin.middleware';
import type { AdminTrackerReviewsUseCases } from '../application/admin-tracker-reviews-use-cases.contract';
import { AdminTrackerReviewsController } from './admin-tracker-reviews.controller';
import { ADMIN_TRACKER_REVIEWS_ROUTE_PATHS } from './admin-tracker-reviews.route.constants';
export const createAdminTrackerReviewsRoutes = (useCases: AdminTrackerReviewsUseCases) => {
  const router = Router();
  const controller = new AdminTrackerReviewsController(useCases);
  router.use(authenticate, requireAdmin);
  router.get(ADMIN_TRACKER_REVIEWS_ROUTE_PATHS.ROOT, controller.list);
  router.patch(ADMIN_TRACKER_REVIEWS_ROUTE_PATHS.CONSENSUS, controller.addConsensusVote);
  router.patch(ADMIN_TRACKER_REVIEWS_ROUTE_PATHS.STATUS, controller.resolve);
  return router;
};
