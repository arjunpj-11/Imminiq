import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { requireAdmin } from '../../../../shared/middlewares/admin.middleware';
import type { AdminTrackerReviewsUseCases } from '../application/admin-tracker-reviews-use-cases.contract';
import { AdminTrackerReviewsController } from './admin-tracker-reviews.controller';
export const createAdminTrackerReviewsRoutes = (useCases: AdminTrackerReviewsUseCases) => {
  const router = Router();
  const controller = new AdminTrackerReviewsController(useCases);
  router.use(authenticate, requireAdmin);
  router.get('/', controller.list);
  router.patch('/:id/consensus', controller.addConsensusVote);
  router.patch('/:id/status', controller.resolve);
  return router;
};
