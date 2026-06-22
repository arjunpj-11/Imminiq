import { Router } from 'express'

import { authenticatedApiIpLimiter } from '../../../shared/middlewares/security-rate-limit.middleware'
import { authenticate } from '../../../shared/middlewares/auth.middleware'
import { validate } from '../../../shared/middlewares/validate'
import { communityController } from './community.controller'
import { COMMUNITY_ROUTE_PATHS } from './community.route.constants'
import { voteVerificationSubmissionSchema } from './community.schema'

const router = Router()

// ─── PROTECTED ROUTES ────────────────────────────────────────────────

router.use(authenticatedApiIpLimiter, authenticate)

router.get(COMMUNITY_ROUTE_PATHS.BROWSE, communityController.getBrowse)
router.get(COMMUNITY_ROUTE_PATHS.TRACKERS, communityController.getTrackers)
router.get(COMMUNITY_ROUTE_PATHS.TOPICS, communityController.getTopics)
router.get(COMMUNITY_ROUTE_PATHS.PERSONAL_STATS, communityController.getPersonalStats)

router.post(COMMUNITY_ROUTE_PATHS.CLONE_TRACKER, communityController.cloneTracker)

router.get(
  COMMUNITY_ROUTE_PATHS.VERIFY_DASHBOARD,
  communityController.getVerificationDashboard,
)
router.get(COMMUNITY_ROUTE_PATHS.VERIFY_QUEUE, communityController.getVerificationQueue)
router.get(
  COMMUNITY_ROUTE_PATHS.VERIFY_LEADERBOARD,
  communityController.getVerificationLeaderboard,
)
router.get(
  COMMUNITY_ROUTE_PATHS.VERIFY_SUBMISSION,
  communityController.getVerificationSubmission,
)
router.post(
  COMMUNITY_ROUTE_PATHS.VERIFY_VOTE,
  validate(voteVerificationSubmissionSchema),
  communityController.voteVerificationSubmission,
)

export default router
export { router as communityRoutes }
