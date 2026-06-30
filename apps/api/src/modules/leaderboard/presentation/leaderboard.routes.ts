import { Router } from 'express'

import { authenticate } from '../../../shared/middlewares/auth.middleware'
import { authenticatedApiIpLimiter } from '../../../shared/middlewares/security-rate-limit.middleware'
import { leaderboardController } from './leaderboard.controller'
import { LEADERBOARD_ROUTE_PATHS } from './leaderboard.route.constants'

const router = Router()

router.get(
  LEADERBOARD_ROUTE_PATHS.ROOT,
  authenticatedApiIpLimiter,
  authenticate,
  leaderboardController.getLeaderboard,
)

router.get(
  LEADERBOARD_ROUTE_PATHS.REWARDS,
  authenticatedApiIpLimiter,
  authenticate,
  leaderboardController.getRewards,
)

export default router
export { router as leaderboardRoutes }
