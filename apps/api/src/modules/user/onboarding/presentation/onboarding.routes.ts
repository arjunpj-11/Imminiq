import { Router } from 'express';

import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { authenticatedApiIpLimiter } from '../../../../shared/middlewares/security-rate-limit.middleware';
import { validate, validateIdentifierParam } from '../../../../shared/middlewares/validate';
import { OnboardingController } from './onboarding.controller';
import type { OnboardingUseCases } from '../application/onboarding-use-cases.contract';
import { ONBOARDING_ROUTE_PATHS } from './onboarding.route.constants';
import { enforcePlanLimit } from '../../subscriptions';
import {
  generateRoadmapSchema,
  step1Schema,
  step2Schema,
  trackerIntakeSchema,
} from './onboarding.schema';

export const createOnboardingRoutes = (useCases: OnboardingUseCases) => {
const onboardingController = new OnboardingController(useCases);
const router = Router();
router.param('jobId', validateIdentifierParam);

// ─── PROTECTED ────────────────────────────────────────────────

router.use(authenticatedApiIpLimiter, authenticate);

router.post(
  ONBOARDING_ROUTE_PATHS.TRACKER_INTAKE,
  validate(trackerIntakeSchema),
  onboardingController.continueTrackerIntake
);

router.post(ONBOARDING_ROUTE_PATHS.STEP_1, validate(step1Schema), onboardingController.saveStep1);

router.post(ONBOARDING_ROUTE_PATHS.STEP_2, validate(step2Schema), onboardingController.saveStep2);

router.post(
  ONBOARDING_ROUTE_PATHS.GENERATE_ROADMAP,
  validate(generateRoadmapSchema),
  enforcePlanLimit('tracker_generation'),
  onboardingController.generateRoadmap
);

router.get(ONBOARDING_ROUTE_PATHS.ACTIVE_ROADMAP_JOB, onboardingController.getActiveRoadmapJob);

router.get(ONBOARDING_ROUTE_PATHS.JOB_STATUS, onboardingController.getJobStatus);

router.get(ONBOARDING_ROUTE_PATHS.JOB_RESULT, onboardingController.getJobResult);

router.post(
  ONBOARDING_ROUTE_PATHS.EVALUATE_ROADMAP,
  enforcePlanLimit('ai_tutor_request'),
  onboardingController.evaluateRoadmap
);

router.get(ONBOARDING_ROUTE_PATHS.EVALUATION_RESULT, onboardingController.getEvaluationResult);

  return router;
};
