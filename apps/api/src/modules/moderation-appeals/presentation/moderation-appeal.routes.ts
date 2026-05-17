import { Router } from 'express'

import { validate } from '../../../shared/middlewares/validate'
import { moderationAppealController } from './moderation-appeal.controller'
import {
  submitModerationAppealSchema,
  getModerationAppealStatusSchema,
} from '../moderation-appeal.schema'

const router = Router()

router.post(
  '/',
  validate(submitModerationAppealSchema),
  moderationAppealController.submitAppeal
)

router.post(
  '/status',
  validate(getModerationAppealStatusSchema),
  moderationAppealController.getAppealStatus
)

export default router
