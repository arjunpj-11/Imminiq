import { Router } from 'express'

import { authenticate } from '../../../../shared/middlewares/auth.middleware'
import { authenticatedApiIpLimiter } from '../../../../shared/middlewares/security-rate-limit.middleware'
import { validate } from '../../../../shared/middlewares/validate'
import type { AdaptiveLearningUseCases } from '../application/adaptive-learning-use-cases.contract'
import { AdaptiveLearningController } from './adaptive-learning.controller'
import { ADAPTIVE_LEARNING_ROUTE_PATHS } from './adaptive-learning.route.constants'
import { adaptiveAdvisorChatSchema } from './adaptive-learning.schema'

export const createAdaptiveLearningRoutes = (
  useCases: AdaptiveLearningUseCases,
) => {
  const router = Router()
  const controller = new AdaptiveLearningController(useCases)

  router.use(authenticatedApiIpLimiter, authenticate)
  router.get(ADAPTIVE_LEARNING_ROUTE_PATHS.ROOT, controller.getDashboard)
  router.post(
    ADAPTIVE_LEARNING_ROUTE_PATHS.GENERATE_ASSESSMENT,
    controller.generateAssessment,
  )
  router.post(
    ADAPTIVE_LEARNING_ROUTE_PATHS.ADVISOR_CHAT,
    validate(adaptiveAdvisorChatSchema),
    controller.chat,
  )

  return router
}
