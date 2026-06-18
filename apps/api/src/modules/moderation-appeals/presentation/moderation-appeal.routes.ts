import { Router } from 'express'
import { validate } from '../../../shared/middlewares/validate'
import { moderationAppealController } from './moderation-appeal.controller'
import {
  getModerationAppealStatusSchema,
  submitModerationAppealSchema,
} from './moderation-appeal.schema'

const router = Router()

// ─── PUBLIC ──────────────────────────────────────────────────

router.post(
  '/',
  validate(submitModerationAppealSchema),
  moderationAppealController.submitAppeal,
)

router.post(
  '/status',
  validate(getModerationAppealStatusSchema),
  moderationAppealController.getAppealStatus,
)

export default router
export { router as moderationAppealRoutes }
