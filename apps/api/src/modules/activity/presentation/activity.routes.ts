import { Router } from 'express'

import { authenticate } from '../../../shared/middlewares/auth.middleware'
import { authenticatedApiIpLimiter } from '../../../shared/middlewares/security-rate-limit.middleware'
import { activityController } from './activity.controller'
import { ACTIVITY_ROUTE_PATHS } from './activity.route.constants'

const router = Router()

router.get(
  ACTIVITY_ROUTE_PATHS.ROOT,
  authenticatedApiIpLimiter,
  authenticate,
  activityController.getPage,
)

router.get(
  ACTIVITY_ROUTE_PATHS.FEED,
  authenticatedApiIpLimiter,
  authenticate,
  activityController.getFeed,
)

export default router
export { router as activityRoutes }
