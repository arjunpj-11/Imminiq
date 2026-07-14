import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { requireAdmin } from '../../../../shared/middlewares/admin.middleware';
import type { AdminTrackersUseCases } from '../application/admin-trackers-use-cases.contract';
import { AdminTrackersController } from './admin-trackers.controller';
export const createAdminTrackersRoutes = (useCases: AdminTrackersUseCases) => {
  const router = Router();
  const controller = new AdminTrackersController(useCases);
  router.use(authenticate, requireAdmin);
  router.get('/', controller.list);
  router.get('/published', controller.listPublished);
  router.post('/published/:id/like', controller.likePublished);
  router.put('/published/:id/rating', controller.ratePublished);
  router.get('/:id', controller.getDetail);
  router.delete('/:id', controller.delete);
  return router;
};
