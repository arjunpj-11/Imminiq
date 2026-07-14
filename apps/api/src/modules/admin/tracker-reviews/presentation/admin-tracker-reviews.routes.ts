import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { requireAdmin } from '../../../../shared/middlewares/admin.middleware';
import type { IAdminTrackerReviewsUseCase } from '../application/use-cases/admin-tracker-reviews.usecase';
import { AdminTrackerReviewsController } from './admin-tracker-reviews.controller';
export const createAdminTrackerReviewsRoutes = (useCase: IAdminTrackerReviewsUseCase) => {
  const router = Router();
  const controller = new AdminTrackerReviewsController(useCase);
  router.use(authenticate, requireAdmin);
  router.get('/', controller.list);
  router.patch('/:id/consensus', controller.addConsensusVote);
  router.patch('/:id/status', controller.resolve);
  return router;
};
