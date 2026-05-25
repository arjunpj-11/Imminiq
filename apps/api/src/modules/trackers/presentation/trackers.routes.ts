// apps/api/src/modules/trackers/presentation/trackers.routes.ts

import { Router } from 'express'

import { authenticate } from '../../../shared/middlewares/auth.middleware'
import { authenticatedApiIpLimiter } from '../../../shared/middlewares/security-rate-limit.middleware'
import { trackerController } from './trackers.controller'

const router = Router()

router.use(authenticatedApiIpLimiter, authenticate)

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

router.post('/:trackerId/topics', trackerController.createTopic)

router.post(
  '/:trackerId/topics/:topicId/subtopics',
  trackerController.createSubtopic
)

router.patch(
  '/:trackerId/subtopics/:subtopicId/progress',
  trackerController.updateSubtopicProgress
)

router.get(
  '/:trackerId/lessons/:subtopicId',
  trackerController.getLesson
)

router.get(
  '/:trackerId/lessons/:subtopicId/chat',
  trackerController.getLessonChatHistory
)

router.get(
  '/:trackerId/lessons/:subtopicId/answer/attempts',
  trackerController.getLessonAnswerAttempts
)

router.get(
  '/:trackerId/lessons/:subtopicId/code/submissions',
  trackerController.getLessonCodeSubmissions
)

router.post(
  '/:trackerId/lessons/:subtopicId/chat',
  trackerController.chatWithLessonTutor
)

router.post(
  '/:trackerId/lessons/:subtopicId/code/run',
  trackerController.runLessonCode
)

router.post(
  '/:trackerId/lessons/:subtopicId/code/submit',
  trackerController.submitLessonCode
)

router.post(
  '/:trackerId/lessons/:subtopicId/code/hint',
  trackerController.getCodeHint
)

router.post(
  '/:trackerId/lessons/:subtopicId/code/optimized-solution',
  trackerController.getOptimizedSolution
)

router.post(
  '/:trackerId/lessons/:subtopicId/answer/verify',
  trackerController.verifyLessonAnswer
)
router.post('/:trackerId/topics/verify', trackerController.verifyTopic)
router.post(
  '/:trackerId/topics/:topicId/subtopics/verify',
  trackerController.verifySubtopic
)
router.post(
  '/:trackerId/evaluation-jobs/:evaluationJobId/missing-topics/:topicIndex/add',
  trackerController.addMissingEvaluationTopic
)

export default router