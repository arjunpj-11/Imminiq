import { Router } from 'express'

import { authenticate } from '../../../shared/middlewares/auth.middleware'
import { trackerController } from './trackers.controller'

const router = Router()

router.use(authenticate)

router.post(
  '/:trackerId/evaluation-jobs/:evaluationJobId/missing-topics/:topicIndex/add',
  trackerController.addMissingEvaluationTopic
)

export default router
