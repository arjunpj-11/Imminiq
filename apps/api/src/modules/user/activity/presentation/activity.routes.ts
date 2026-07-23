import { Router } from 'express';

import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { authenticatedApiUserLimiter } from '../../../../shared/middlewares/security-rate-limit.middleware';
import { ActivityController } from './activity.controller';
import type { ActivityUseCases } from '../application/activity-use-cases.contract';
import { ACTIVITY_ROUTE_PATHS } from './activity.route.constants';

export const createActivityRoutes = (useCases: ActivityUseCases) => {
  const activityController = new ActivityController(useCases);
  const router = Router();

  router.get(
    ACTIVITY_ROUTE_PATHS.ROOT,
    authenticate,
    authenticatedApiUserLimiter,
    activityController.getPage
  );

  router.get(
    ACTIVITY_ROUTE_PATHS.FEED,
    authenticate,
    authenticatedApiUserLimiter,
    activityController.getFeed
  );

  return router;
};
