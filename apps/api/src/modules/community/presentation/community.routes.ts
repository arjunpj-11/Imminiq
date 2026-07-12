import { Router } from 'express'

import { authenticatedApiIpLimiter } from '../../../shared/middlewares/security-rate-limit.middleware'
import { authenticate } from '../../../shared/middlewares/auth.middleware'
import { validate, validateIdentifierParam, validateQuery } from '../../../shared/middlewares/validate'
import { CommunityController } from './community.controller'
import { createCommunityComposition } from '../community.factory'
import { COMMUNITY_ROUTE_PATHS } from './community.route.constants'
import {
  sendTrackerForVerificationSchema,
  upsertCommunityTrackerReviewSchema,
  voteVerificationSubmissionSchema,
  communityTrackerQuerySchema,
  communityPaginationQuerySchema,
} from './community.schema'

const communityController = new CommunityController(createCommunityComposition().useCases)
const router = Router()
router.param('trackerId', validateIdentifierParam)
router.param('reviewId', validateIdentifierParam)
router.param('submissionId', validateIdentifierParam)

// ─── PROTECTED ROUTES ────────────────────────────────────────────────

router.use(authenticatedApiIpLimiter, authenticate)

router.get(COMMUNITY_ROUTE_PATHS.BROWSE, validateQuery(communityTrackerQuerySchema), communityController.getBrowse)
router.get(
  COMMUNITY_ROUTE_PATHS.TRACKER_DETAIL,
  communityController.getPublicTrackerDetail,
)
router.post(COMMUNITY_ROUTE_PATHS.CLONE_TRACKER, communityController.cloneTracker)

router.post(
  COMMUNITY_ROUTE_PATHS.SUBMIT_TRACKER_VERIFICATION,
  validate(sendTrackerForVerificationSchema),
  communityController.submitTrackerForVerification,
)
router.post(
  COMMUNITY_ROUTE_PATHS.TRACKER_REVIEW,
  validate(upsertCommunityTrackerReviewSchema),
  communityController.upsertTrackerReview,
)
router.post(
  COMMUNITY_ROUTE_PATHS.REVIEW_HELPFUL,
  communityController.toggleReviewHelpful,
)

router.get(
  COMMUNITY_ROUTE_PATHS.VERIFY_DASHBOARD,
  validateQuery(communityPaginationQuerySchema),
  communityController.getVerificationDashboard,
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

router.post(
  COMMUNITY_ROUTE_PATHS.TRACKER_LIKE,
  communityController.toggleTrackerLike,
)

export default router
export { router as communityRoutes }
