import { Router } from 'express';

import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { authenticatedApiIpLimiter } from '../../../../shared/middlewares/security-rate-limit.middleware';
import { validate, validateIdentifierParam } from '../../../../shared/middlewares/validate';
import { TrackerCreationController } from './tracker-creation.controller';
import type { TrackerCreationUseCases } from '../application/tracker-creation-use-cases.contract';
import { TRACKER_CREATION_ROUTE_PATHS } from './tracker-creation.route.constants';
import type { PlanLimitMiddleware } from '../../subscriptions';
import {
  generateRoadmapSchema,
  step1Schema,
  step2Schema,
  trackerIntakeSchema,
} from './tracker-creation.schema';

export const createTrackerCreationRoutes = (
  useCases: TrackerCreationUseCases,
  enforcePlanLimit: PlanLimitMiddleware
) => {
  const trackerCreationController = new TrackerCreationController(useCases);
  const router = Router();
  router.param('jobId', validateIdentifierParam);
  router.param('trackerId', validateIdentifierParam);

  // ─── PROTECTED ────────────────────────────────────────────────

  router.use(authenticatedApiIpLimiter, authenticate);

  router.post(
    TRACKER_CREATION_ROUTE_PATHS.TRACKER_INTAKE,
    validate(trackerIntakeSchema),
    trackerCreationController.continueTrackerIntake
  );

  router.post(TRACKER_CREATION_ROUTE_PATHS.STEP_1, validate(step1Schema), trackerCreationController.saveStep1);

  router.post(TRACKER_CREATION_ROUTE_PATHS.STEP_2, validate(step2Schema), trackerCreationController.saveStep2);

  router.post(
    TRACKER_CREATION_ROUTE_PATHS.GENERATE_ROADMAP,
    validate(generateRoadmapSchema),
    enforcePlanLimit('tracker_generation'),
    trackerCreationController.generateRoadmap
  );

  router.get(TRACKER_CREATION_ROUTE_PATHS.ACTIVE_ROADMAP_JOB, trackerCreationController.getActiveRoadmapJob);

  router.get(TRACKER_CREATION_ROUTE_PATHS.JOB_STATUS, trackerCreationController.getJobStatus);

  router.get(TRACKER_CREATION_ROUTE_PATHS.JOB_RESULT, trackerCreationController.getJobResult);

  router.post(
    TRACKER_CREATION_ROUTE_PATHS.EVALUATE_ROADMAP,
    enforcePlanLimit('ai_tutor_request'),
    trackerCreationController.evaluateRoadmap
  );

  router.get(TRACKER_CREATION_ROUTE_PATHS.EVALUATION_RESULT, trackerCreationController.getEvaluationResult);

  router.post(
    TRACKER_CREATION_ROUTE_PATHS.ANALYZE_CLONED_TRACKER,
    enforcePlanLimit('ai_tutor_request'),
    trackerCreationController.analyzeClonedTracker
  );

  return router;
};
