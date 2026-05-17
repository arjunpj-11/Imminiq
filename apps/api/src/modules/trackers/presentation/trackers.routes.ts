import { Router } from 'express'

import { authenticate } from '../../../shared/middlewares/auth.middleware'
import { authenticatedApiIpLimiter } from '../../../shared/middlewares/security-rate-limit.middleware'
import { trackerController } from './trackers.controller'

const router = Router()

router.use(
  authenticatedApiIpLimiter,
  authenticate
)

router.post(
  '/:trackerId/evaluation-jobs/:evaluationJobId/missing-topics/:topicIndex/add',
  trackerController.addMissingEvaluationTopic
)

export default router
