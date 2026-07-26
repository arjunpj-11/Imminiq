import { Router } from 'express';

import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { authenticatedApiUserLimiter } from '../../../../shared/middlewares/security-rate-limit.middleware';
import {
  validate,
  validateIdentifierParam,
  validateObjectIdParam,
  validateQuery,
} from '../../../../shared/middlewares/validate.middleware';
import { MockTestsController } from './mock-tests.controller';
import type { MockTestsUseCases } from '../application/mock-tests-use-cases.contract';
import { MOCK_TEST_ROUTE_PATHS } from './mock-tests.route.constants';
import type { PlanLimitMiddleware } from '../../subscriptions';
import {
  createMockTestSchema,
  flagQuestionSchema,
  reportQuestionIssueSchema,
  generateMockTestSchema,
  runMockTestCodeSchema,
  submitAnswerSchema,
  submitMockTestCodeSchema,
  mockTestListQuerySchema,
} from './mock-tests.schema';

export const createMockTestsRoutes = (
  useCases: MockTestsUseCases,
  enforcePlanLimit: PlanLimitMiddleware
) => {
  const mockTestsController = new MockTestsController(useCases);
  const router = Router();
  router.param('attemptId', validateObjectIdParam);
  router.param('questionId', validateObjectIdParam);
  router.param('testId', validateObjectIdParam);
  router.param('jobId', validateObjectIdParam);
  router.param('shareToken', validateIdentifierParam);

  // ─── PROTECTED ───────────────────────────────────────────────

  router.use(authenticate, authenticatedApiUserLimiter);

  router.get(
    MOCK_TEST_ROUTE_PATHS.ROOT,
    validateQuery(mockTestListQuerySchema),
    mockTestsController.listTests
  );

  router.post(
    MOCK_TEST_ROUTE_PATHS.ROOT,
    validate(createMockTestSchema),
    mockTestsController.createTest
  );

  router.post(
    MOCK_TEST_ROUTE_PATHS.GENERATE,
    validate(generateMockTestSchema),
    enforcePlanLimit('mock_test_generation'),
    mockTestsController.generateTest
  );

  router.get(MOCK_TEST_ROUTE_PATHS.ACTIVE_GENERATION, mockTestsController.getActiveGeneration);
  router.get(MOCK_TEST_ROUTE_PATHS.GENERATION_STATUS, mockTestsController.getGenerationStatus);

  router.post(MOCK_TEST_ROUTE_PATHS.IMPORT_SHARED, mockTestsController.importSharedTest);

  router.post(
    MOCK_TEST_ROUTE_PATHS.RUN_CODE,
    validate(runMockTestCodeSchema),
    mockTestsController.runCode
  );

  router.post(
    MOCK_TEST_ROUTE_PATHS.SUBMIT_CODE,
    validate(submitMockTestCodeSchema),
    mockTestsController.submitCode
  );

  router.get(MOCK_TEST_ROUTE_PATHS.HISTORY, mockTestsController.getHistory);

  router.get(MOCK_TEST_ROUTE_PATHS.ANALYTICS_TRENDS, mockTestsController.getAnalytics);

  router.get(
    MOCK_TEST_ROUTE_PATHS.ANALYTICS_AI_INSIGHTS,
    enforcePlanLimit('ai_tutor_request'),
    mockTestsController.getAIInsights
  );

  router.get(
    MOCK_TEST_ROUTE_PATHS.ANALYTICS_TOPIC_BREAKDOWN,
    mockTestsController.getTopicBreakdown
  );

  router.get(MOCK_TEST_ROUTE_PATHS.ATTEMPT_QUESTIONS, mockTestsController.getAttemptQuestions);

  router.post(
    MOCK_TEST_ROUTE_PATHS.ATTEMPT_ANSWERS,
    validate(submitAnswerSchema),
    mockTestsController.submitAnswer
  );

  router.post(
    MOCK_TEST_ROUTE_PATHS.ATTEMPT_FLAG,
    validate(flagQuestionSchema),
    mockTestsController.flagQuestion
  );

  router.post(
    MOCK_TEST_ROUTE_PATHS.ATTEMPT_REPORT_QUESTION,
    validate(reportQuestionIssueSchema),
    mockTestsController.reportQuestionIssue
  );

  router.post(MOCK_TEST_ROUTE_PATHS.ATTEMPT_FINISH, mockTestsController.finishAttempt);

  router.get(MOCK_TEST_ROUTE_PATHS.ATTEMPT_RESULT, mockTestsController.getAttemptResult);

  router.get(MOCK_TEST_ROUTE_PATHS.ATTEMPT_ANALYSIS, mockTestsController.getAttemptAnalysis);

  router.post(MOCK_TEST_ROUTE_PATHS.ATTEMPT_RETAKE, mockTestsController.retakeTest);

  router.post(MOCK_TEST_ROUTE_PATHS.SHARE_TEST, mockTestsController.shareTest);

  router.get(MOCK_TEST_ROUTE_PATHS.TEST_BY_ID, mockTestsController.getTest);

  router.post(MOCK_TEST_ROUTE_PATHS.START_ATTEMPT, mockTestsController.startAttempt);

  return router;
};
