import { Router } from 'express'

import { validate } from '../../../shared/middlewares/validate'
import { moderationAppealController } from './moderation-appeal.controller'
import { MODERATION_APPEAL_ROUTE_PATHS } from './moderation-appeal.route.constants'
import {
  getModerationAppealStatusSchema,
  submitModerationAppealSchema,
} from './moderation-appeal.schema'

const router = Router()

// ─── PUBLIC ──────────────────────────────────────────────────

router.post(
  MODERATION_APPEAL_ROUTE_PATHS.ROOT,
  validate(submitModerationAppealSchema),
  moderationAppealController.submitAppeal
)

router.post(
  MODERATION_APPEAL_ROUTE_PATHS.STATUS,
  validate(getModerationAppealStatusSchema),
  moderationAppealController.getAppealStatus
)

export default router
export { router as moderationAppealRoutes }