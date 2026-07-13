import { Router } from 'express'

import { authenticate } from '../../../../shared/middlewares/auth.middleware'
import { authenticatedApiIpLimiter } from '../../../../shared/middlewares/security-rate-limit.middleware'
import { ActivityController } from './activity.controller'
import type { ActivityUseCases } from '../application/activity-use-cases.contract'
import { ACTIVITY_ROUTE_PATHS } from './activity.route.constants'

export const createActivityRoutes = (useCases: ActivityUseCases) => {
const activityController = new ActivityController(useCases)
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

return router
}
