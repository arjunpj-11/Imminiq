import { Router } from 'express'

import { authenticate } from '../../../shared/middlewares/auth.middleware'
import { validate, validateUsernameParam } from '../../../shared/middlewares/validate'
import { UsersController } from './users.controller'
import { createUsersComposition } from '../users.factory'
import { USER_ROUTE_PATHS } from './users.route.constants'
import { updateMyProfileSchema } from './users.schema'

const usersController = new UsersController(createUsersComposition().useCases)
const router = Router()
router.param('username', validateUsernameParam)

// ─── PUBLIC ──────────────────────────────────────────────────

router.get(
  USER_ROUTE_PATHS.PUBLIC_PROFILE,
  usersController.getPublicProfile
)

// ─── PROTECTED ───────────────────────────────────────────────

router.use(authenticate)

router.get(
  USER_ROUTE_PATHS.ME,
  usersController.getMe
)

router.patch(
  USER_ROUTE_PATHS.ME,
  validate(updateMyProfileSchema),
  usersController.updateMe
)

router.get(
  USER_ROUTE_PATHS.MY_STATS,
  usersController.getMyStats
)

router.get(
  USER_ROUTE_PATHS.MY_ACTIVITY,
  usersController.getMyActivity
)

router.get(
  USER_ROUTE_PATHS.MY_RECENT_ACTIVITY,
  usersController.getMyRecentActivity
)

router.get(
  USER_ROUTE_PATHS.MY_STREAK,
  usersController.getMyStreak
)

router.get(
  USER_ROUTE_PATHS.MY_PUBLISHED_TRACKERS,
  usersController.getMyPublishedTrackers
)

router.get(
  USER_ROUTE_PATHS.MY_BADGES,
  usersController.getMyBadges
)

export default router
export { router as usersRoutes }
