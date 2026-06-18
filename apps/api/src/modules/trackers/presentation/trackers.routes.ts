import { Router } from 'express'

import { authenticate } from '../../../shared/middlewares/auth.middleware'
import { authenticatedApiIpLimiter } from '../../../shared/middlewares/security-rate-limit.middleware'
import { trackerController } from './trackers.controller'

const router = Router()

// ─── PROTECTED ────────────────────────────────────────────────────────────────

router.use(authenticatedApiIpLimiter, authenticate)

// ─── TRACKERS ────────────────────────────────────────────────────────────────

router.get('/summary', trackerController.getSummary)
router.get('/', trackerController.listTrackers)
router.post('/', trackerController.createTracker)
router.get('/:trackerId', trackerController.getTrackerDetails)
router.patch('/:trackerId', trackerController.updateTracker)
router.delete('/:trackerId', trackerController.deleteTracker)
router.post('/:trackerId/archive', trackerController.archiveTracker)
router.post('/:trackerId/restore', trackerController.restoreTracker)
router.post('/:trackerId/publish', trackerController.publishTracker)
router.post('/:trackerId/unpublish', trackerController.unpublishTracker)
router.get('/:trackerId/roadmap', trackerController.getRoadmap)

// ─── ROADMAP CONTENT ─────────────────────────────────────────────────────────

router.post('/:trackerId/topics', trackerController.createTopic)
router.post(
  '/:trackerId/topics/:topicId/subtopics',
  trackerController.createSubtopic,
)
router.patch(
  '/:trackerId/subtopics/:subtopicId/progress',
  trackerController.updateSubtopicProgress,
)
router.post('/:trackerId/topics/verify', trackerController.verifyTopic)
router.post(
  '/:trackerId/topics/:topicId/subtopics/verify',
  trackerController.verifySubtopic,
)
router.post(
  '/:trackerId/evaluation-jobs/:evaluationJobId/missing-topics/:topicIndex/add',
  trackerController.addMissingEvaluationTopic,
)

// ─── LESSONS ─────────────────────────────────────────────────────────────────

router.get('/:trackerId/lessons/:subtopicId', trackerController.getLesson)
router.get(
  '/:trackerId/lessons/:subtopicId/chat',
  trackerController.getLessonChatHistory,
)
router.post(
  '/:trackerId/lessons/:subtopicId/chat',
  trackerController.chatWithLessonTutor,
)
router.delete(
  '/:trackerId/lessons/:subtopicId/chat',
  trackerController.clearLessonChatHistory,
)
router.get(
  '/:trackerId/lessons/:subtopicId/questions',
  trackerController.getLessonGeneratedQuestions,
)
router.post(
  '/:trackerId/lessons/:subtopicId/questions/generate',
  trackerController.generateLessonQuestions,
)
router.get(
  '/:trackerId/lessons/:subtopicId/question-solution',
  trackerController.getLessonQuestionSolution,
)
router.post(
  '/:trackerId/lessons/:subtopicId/question-solution/generate',
  trackerController.generateLessonQuestionSolution,
)
router.get(
  '/:trackerId/lessons/:subtopicId/question-solution/doubts',
  trackerController.getLessonQuestionSolutionDoubts,
)
router.post(
  '/:trackerId/lessons/:subtopicId/question-solution/doubts',
  trackerController.askLessonQuestionSolutionDoubt,
)
router.delete(
  '/:trackerId/lessons/:subtopicId/question-solution/doubts',
  trackerController.clearLessonQuestionSolutionDoubts,
)
router.post(
  '/:trackerId/lessons/:subtopicId/visualize',
  trackerController.generateLessonVisualization,
)

// ─── PRACTICE ────────────────────────────────────────────────────────────────

router.get(
  '/:trackerId/lessons/:subtopicId/answer/attempts',
  trackerController.getLessonAnswerAttempts,
)
router.post(
  '/:trackerId/lessons/:subtopicId/answer/verify',
  trackerController.verifyLessonAnswer,
)
router.get(
  '/:trackerId/lessons/:subtopicId/code/submissions',
  trackerController.getLessonCodeSubmissions,
)
router.post(
  '/:trackerId/lessons/:subtopicId/code/run',
  trackerController.runLessonCode,
)
router.post(
  '/:trackerId/lessons/:subtopicId/code/submit',
  trackerController.submitLessonCode,
)
router.post(
  '/:trackerId/lessons/:subtopicId/code/hint',
  trackerController.getCodeHint,
)
router.post(
  '/:trackerId/lessons/:subtopicId/code/optimized-solution',
  trackerController.getOptimizedSolution,
)

export default router
export { router as trackerRoutes }
