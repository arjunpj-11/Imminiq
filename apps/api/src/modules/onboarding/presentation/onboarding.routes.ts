import { Router } from 'express'
import { authenticate } from '../../../shared/middlewares/auth.middleware'
import { authenticatedApiIpLimiter } from '../../../shared/middlewares/security-rate-limit.middleware'
import { validate } from '../../../shared/middlewares/validate'
import { onboardingController } from './onboarding.controller'
import {
  generateRoadmapSchema,
  step1Schema,
  step2Schema,
} from './onboarding.schema'

const router = Router()

// ─── PROTECTED ────────────────────────────────────────────────

router.use(authenticatedApiIpLimiter, authenticate)

router.get('/status', onboardingController.getStatus)

router.post(
  '/step-1',
  validate(step1Schema),
  onboardingController.saveStep1,
)

router.post(
  '/step-2',
  validate(step2Schema),
  onboardingController.saveStep2,
)

router.post(
  '/generate-roadmap',
  validate(generateRoadmapSchema),
  onboardingController.generateRoadmap,
)

router.get('/jobs/:jobId/status', onboardingController.getJobStatus)
router.get('/jobs/:jobId/result', onboardingController.getJobResult)
router.post('/jobs/:jobId/evaluate', onboardingController.evaluateRoadmap)
router.get(
  '/jobs/:jobId/evaluation-result',
  onboardingController.getEvaluationResult,
)

export default router
export { router as onboardingRoutes }
