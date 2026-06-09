import { Router } from 'express'
import { mockTestsController } from './mock-tests.controller'
import { authenticate } from '../../../shared/middlewares/auth.middleware'
import { validate } from '../../../shared/middlewares/validate'
import { authenticatedApiIpLimiter } from '../../../shared/middlewares/security-rate-limit.middleware'
import {
  createMockTestSchema,
  generateMockTestSchema,
  submitAnswerSchema,
  flagQuestionSchema,
} from './mock-tests.schema'

const router = Router()

router.use(authenticatedApiIpLimiter, authenticate)

router.get('/', mockTestsController.listTests)
router.post('/', validate(createMockTestSchema), mockTestsController.createTest)
router.post('/generate', validate(generateMockTestSchema), mockTestsController.generateTest)

router.get('/public', mockTestsController.listPublicTests)

router.post('/shared/:shareToken/import', mockTestsController.importSharedTest)

router.get('/history', mockTestsController.getHistory)
router.get('/analytics', mockTestsController.getAnalytics)
router.get('/analytics/trends', mockTestsController.getAnalytics)
router.get('/analytics/ai-insights', mockTestsController.getAIInsights)
router.get('/analytics/topic-breakdown', mockTestsController.getTopicBreakdown)

router.get('/attempts/:attemptId/questions', mockTestsController.getAttemptQuestions)
router.post('/attempts/:attemptId/answers', validate(submitAnswerSchema), mockTestsController.submitAnswer)
router.post('/attempts/:attemptId/flag', validate(flagQuestionSchema), mockTestsController.flagQuestion)
router.post('/attempts/:attemptId/finish', mockTestsController.finishAttempt)
router.get('/attempts/:attemptId/result', mockTestsController.getAttemptResult)
router.get('/attempts/:attemptId/analysis', mockTestsController.getAttemptAnalysis)
router.post('/attempts/:attemptId/retake', mockTestsController.retakeTest)

router.post('/:testId/share', mockTestsController.shareTest)
router.get('/:testId', mockTestsController.getTest)
router.post('/:testId/start', mockTestsController.startAttempt)

export default router