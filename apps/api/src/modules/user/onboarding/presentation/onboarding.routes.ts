import { Router } from 'express'

import { authenticate } from '../../../../shared/middlewares/auth.middleware'
import { authenticatedApiIpLimiter } from '../../../../shared/middlewares/security-rate-limit.middleware'
import { validate, validateIdentifierParam } from '../../../../shared/middlewares/validate'
import { OnboardingController } from './onboarding.controller'
import { createOnboardingComposition } from '../onboarding.factory'
import { ONBOARDING_ROUTE_PATHS } from './onboarding.route.constants'
import {
  generateRoadmapSchema,
  step1Schema,
  step2Schema,
} from './onboarding.schema'

const onboardingController = new OnboardingController(createOnboardingComposition().useCases)
const router = Router()
router.param('jobId', validateIdentifierParam)

// ─── PROTECTED ────────────────────────────────────────────────

router.use(authenticatedApiIpLimiter, authenticate)

router.post(
  ONBOARDING_ROUTE_PATHS.STEP_1,
  validate(step1Schema),
  onboardingController.saveStep1
)

router.post(
  ONBOARDING_ROUTE_PATHS.STEP_2,
  validate(step2Schema),
  onboardingController.saveStep2
)

router.post(
  ONBOARDING_ROUTE_PATHS.GENERATE_ROADMAP,
  validate(generateRoadmapSchema),
  onboardingController.generateRoadmap
)

router.get(
  ONBOARDING_ROUTE_PATHS.JOB_STATUS,
  onboardingController.getJobStatus
)

router.get(
  ONBOARDING_ROUTE_PATHS.JOB_RESULT,
  onboardingController.getJobResult
)

router.post(
  ONBOARDING_ROUTE_PATHS.EVALUATE_ROADMAP,
  onboardingController.evaluateRoadmap
)

router.get(
  ONBOARDING_ROUTE_PATHS.EVALUATION_RESULT,
  onboardingController.getEvaluationResult
)

export default router
export { router as onboardingRoutes }
