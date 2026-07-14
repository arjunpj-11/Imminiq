import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { requireAdmin } from '../../../../shared/middlewares/admin.middleware';
import type { AdminTrackersUseCases } from '../application/admin-trackers-use-cases.contract';
import { AdminTrackersController } from './admin-trackers.controller';
import { ADMIN_TRACKERS_ROUTE_PATHS } from './admin-trackers.route.constants';
export const createAdminTrackersRoutes = (useCases: AdminTrackersUseCases) => {
  const router = Router();
  const controller = new AdminTrackersController(useCases);
  router.use(authenticate, requireAdmin);
  router.get(ADMIN_TRACKERS_ROUTE_PATHS.ROOT, controller.list);
  router.get(ADMIN_TRACKERS_ROUTE_PATHS.PUBLISHED, controller.listPublished);
  router.post(ADMIN_TRACKERS_ROUTE_PATHS.PUBLISHED_LIKE, controller.likePublished);
  router.put(ADMIN_TRACKERS_ROUTE_PATHS.PUBLISHED_RATING, controller.ratePublished);
  router.get(ADMIN_TRACKERS_ROUTE_PATHS.DETAIL, controller.getDetail);
  router.delete(ADMIN_TRACKERS_ROUTE_PATHS.DETAIL, controller.delete);
  return router;
};
