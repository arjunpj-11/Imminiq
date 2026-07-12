import type { NextFunction, Request, Response } from 'express'
import { Router } from 'express'
import type { ZodTypeAny } from 'zod'

import { authenticate } from '../../../shared/middlewares/auth.middleware'
import { authenticatedApiIpLimiter } from '../../../shared/middlewares/security-rate-limit.middleware'
import { validate, validateIdentifierParam } from '../../../shared/middlewares/validate'
import { TrackerController } from './trackers.controller'
import type { TrackerUseCases } from '../application/tracker-use-cases.contract'
import { TRACKER_ROUTE_PATHS } from './trackers.route.constants'
import {
  trackerListQuerySchema,
  createTrackerSchema,
  updateTrackerSchema,
  publishTrackerSchema,
  createTopicSchema,
  createSubtopicSchema,
  updateSubtopicProgressSchema,
  lessonChatSchema,
  generateLessonQuestionsSchema,
  lessonQuestionSchema,
  askLessonQuestionSolutionDoubtSchema,
  verifyLessonAnswerSchema,
  runLessonCodeSchema,
  submitLessonCodeSchema,
  getCodeHintSchema,
  getOptimizedSolutionSchema,
  verifyTopicSchema,
  verifySubtopicSchema,
} from './trackers.schema'

export const createTrackerRoutes = (useCases: TrackerUseCases) => {
const trackerController = new TrackerController(useCases)
const router = Router()
router.param('trackerId', validateIdentifierParam)
router.param('topicId', validateIdentifierParam)
router.param('subtopicId', validateIdentifierParam)
router.param('evaluationJobId', validateIdentifierParam)

const validateQuery =
  (localKey: string, schema: ZodTypeAny) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      res.locals[localKey] = schema.parse(req.query)
      next()
    } catch (error) {
      next(error)
    }
  }

// ─── PROTECTED ────────────────────────────────────────────────────────────────

router.use(authenticatedApiIpLimiter, authenticate)

// ─── TRACKERS ────────────────────────────────────────────────────────────────

router.get(
  TRACKER_ROUTE_PATHS.SUMMARY,
  trackerController.getSummary
)

router.get(
  TRACKER_ROUTE_PATHS.ROOT,
  validateQuery('trackerListQuery', trackerListQuerySchema),
  trackerController.listTrackers
)

router.post(
  TRACKER_ROUTE_PATHS.ROOT,
  validate(createTrackerSchema),
  trackerController.createTracker
)

router.get(
  TRACKER_ROUTE_PATHS.TRACKER_BY_ID,
  trackerController.getTrackerDetails
)

router.patch(
  TRACKER_ROUTE_PATHS.TRACKER_BY_ID,
  validate(updateTrackerSchema),
  trackerController.updateTracker
)

router.delete(
  TRACKER_ROUTE_PATHS.TRACKER_BY_ID,
  trackerController.deleteTracker
)

router.post(
  TRACKER_ROUTE_PATHS.ARCHIVE_TRACKER,
  trackerController.archiveTracker
)

router.post(
  TRACKER_ROUTE_PATHS.RESTORE_TRACKER,
  trackerController.restoreTracker
)

router.post(
  TRACKER_ROUTE_PATHS.PUBLISH_TRACKER,
  validate(publishTrackerSchema),
  trackerController.publishTracker
)

router.post(
  TRACKER_ROUTE_PATHS.UNPUBLISH_TRACKER,
  trackerController.unpublishTracker
)

router.get(
  TRACKER_ROUTE_PATHS.ROADMAP,
  trackerController.getRoadmap
)

// ─── ROADMAP CONTENT ─────────────────────────────────────────────────────────

router.post(
  TRACKER_ROUTE_PATHS.TOPICS,
  validate(createTopicSchema),
  trackerController.createTopic
)

router.post(
  TRACKER_ROUTE_PATHS.SUBTOPICS,
  validate(createSubtopicSchema),
  trackerController.createSubtopic
)

router.patch(
  TRACKER_ROUTE_PATHS.SUBTOPIC_PROGRESS,
  validate(updateSubtopicProgressSchema),
  trackerController.updateSubtopicProgress
)

router.post(
  TRACKER_ROUTE_PATHS.VERIFY_TOPIC,
  validate(verifyTopicSchema),
  trackerController.verifyTopic
)

router.post(
  TRACKER_ROUTE_PATHS.VERIFY_SUBTOPIC,
  validate(verifySubtopicSchema),
  trackerController.verifySubtopic
)

router.post(
  TRACKER_ROUTE_PATHS.ADD_MISSING_EVALUATION_TOPIC,
  trackerController.addMissingEvaluationTopic
)

// ─── LESSONS ─────────────────────────────────────────────────────────────────

router.get(
  TRACKER_ROUTE_PATHS.LESSON,
  trackerController.getLesson
)

router.get(
  TRACKER_ROUTE_PATHS.LESSON_CHAT,
  trackerController.getLessonChatHistory
)

router.post(
  TRACKER_ROUTE_PATHS.LESSON_CHAT,
  validate(lessonChatSchema),
  trackerController.chatWithLessonTutor
)

router.delete(
  TRACKER_ROUTE_PATHS.LESSON_CHAT,
  trackerController.clearLessonChatHistory
)

router.get(
  TRACKER_ROUTE_PATHS.LESSON_QUESTIONS,
  trackerController.getLessonGeneratedQuestions
)

router.post(
  TRACKER_ROUTE_PATHS.GENERATE_LESSON_QUESTIONS,
  validate(generateLessonQuestionsSchema),
  trackerController.generateLessonQuestions
)

router.get(
  TRACKER_ROUTE_PATHS.LESSON_QUESTION_SOLUTION,
  validateQuery('lessonQuestionQuery', lessonQuestionSchema),
  trackerController.getLessonQuestionSolution
)

router.post(
  TRACKER_ROUTE_PATHS.GENERATE_LESSON_QUESTION_SOLUTION,
  validate(lessonQuestionSchema),
  trackerController.generateLessonQuestionSolution
)

router.get(
  TRACKER_ROUTE_PATHS.LESSON_QUESTION_SOLUTION_DOUBTS,
  validateQuery('lessonQuestionQuery', lessonQuestionSchema),
  trackerController.getLessonQuestionSolutionDoubts
)

router.post(
  TRACKER_ROUTE_PATHS.LESSON_QUESTION_SOLUTION_DOUBTS,
  validate(askLessonQuestionSolutionDoubtSchema),
  trackerController.askLessonQuestionSolutionDoubt
)

router.delete(
  TRACKER_ROUTE_PATHS.LESSON_QUESTION_SOLUTION_DOUBTS,
  validateQuery('lessonQuestionQuery', lessonQuestionSchema),
  trackerController.clearLessonQuestionSolutionDoubts
)

router.post(
  TRACKER_ROUTE_PATHS.LESSON_VISUALIZATION,
  trackerController.generateLessonVisualization
)

// ─── PRACTICE ────────────────────────────────────────────────────────────────

router.get(
  TRACKER_ROUTE_PATHS.LESSON_ANSWER_ATTEMPTS,
  trackerController.getLessonAnswerAttempts
)

router.post(
  TRACKER_ROUTE_PATHS.VERIFY_LESSON_ANSWER,
  validate(verifyLessonAnswerSchema),
  trackerController.verifyLessonAnswer
)

router.get(
  TRACKER_ROUTE_PATHS.LESSON_CODE_SUBMISSIONS,
  trackerController.getLessonCodeSubmissions
)

router.post(
  TRACKER_ROUTE_PATHS.RUN_LESSON_CODE,
  validate(runLessonCodeSchema),
  trackerController.runLessonCode
)

router.post(
  TRACKER_ROUTE_PATHS.SUBMIT_LESSON_CODE,
  validate(submitLessonCodeSchema),
  trackerController.submitLessonCode
)

router.post(
  TRACKER_ROUTE_PATHS.CODE_HINT,
  validate(getCodeHintSchema),
  trackerController.getCodeHint
)

router.post(
  TRACKER_ROUTE_PATHS.OPTIMIZED_SOLUTION,
  validate(getOptimizedSolutionSchema),
  trackerController.getOptimizedSolution
)

return router
}
