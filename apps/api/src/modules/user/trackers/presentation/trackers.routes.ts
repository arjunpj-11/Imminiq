import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { Router } from 'express';
import type { ZodTypeAny } from 'zod';

import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { authenticatedApiUserLimiter } from '../../../../shared/middlewares/security-rate-limit.middleware';
import {
  validate,
  validateObjectIdParam,
} from '../../../../shared/middlewares/validate.middleware';
import { TrackerManagementController } from './tracker-management.controller';
import { TrackerRoadmapController } from './tracker-roadmap.controller';
import { TrackerLessonsController } from './tracker-lessons.controller';
import { TrackerClanChallengesController } from './tracker-clan-challenges.controller';
import { TrackerClanController } from './tracker-clan.controller';
import type { TrackerUseCases } from '../application/tracker-use-cases.contract';
import { TRACKER_ROUTE_PATHS } from './trackers.route.constants';
import type { PlanLimitMiddleware } from '../../subscriptions';
import {
  trackerListQuerySchema,
  trackerDomainsQuerySchema,
  createTrackerSchema,
  updateTrackerSchema,
  publishTrackerSchema,
  createTopicSchema,
  createSubtopicSchema,
  importTrackerOutlineSchema,
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
  reviewTopicContributionSchema,
  reportTrackerSchema,
  reviewClanJoinSchema,
  updateClanMemberSchema,
  transferClanOwnershipSchema,
  updateTrackerTopicSchema,
  createClanChallengeSchema,
  submitClanChallengeSchema,
  chooseClanChallengeCheckpointSchema,
  answerClanChallengeNodeSchema,
  extendClanChallengeSchema,
  respondClanRoleInvitationSchema,
  clanMessagesQuerySchema,
} from './trackers.schema';
import {
  parseTrackerOutlineUpload,
  trackerOutlineUpload,
} from './tracker-outline-upload.middleware';

export const createTrackerRoutes = (
  useCases: TrackerUseCases,
  enforcePlanLimit: PlanLimitMiddleware,
  requireTrackerCreation: RequestHandler
) => {
  const managementController = new TrackerManagementController(useCases);
  const roadmapController = new TrackerRoadmapController(useCases);
  const lessonsController = new TrackerLessonsController(useCases);
  const clanChallengesController = new TrackerClanChallengesController(useCases);
  const clanController = new TrackerClanController(useCases);
  const router = Router();
  router.param('trackerId', validateObjectIdParam);
  router.param('topicId', validateObjectIdParam);
  router.param('subtopicId', validateObjectIdParam);
  router.param('evaluationJobId', validateObjectIdParam);
  router.param('contributionId', validateObjectIdParam);
  router.param('requestId', validateObjectIdParam);
  router.param('memberId', validateObjectIdParam);
  router.param('challengeId', validateObjectIdParam);
  router.param('invitationId', validateObjectIdParam);

  const validateQuery =
    (localKey: string, schema: ZodTypeAny) => (req: Request, res: Response, next: NextFunction) => {
      try {
        res.locals[localKey] = schema.parse(req.query);
        next();
      } catch (error) {
        next(error);
      }
    };

  // ─── PROTECTED ────────────────────────────────────────────────────────────────

  router.use(authenticate, authenticatedApiUserLimiter);

  // ─── TRACKERS ────────────────────────────────────────────────────────────────

  router.get(TRACKER_ROUTE_PATHS.SUMMARY, managementController.getSummary);

  router.get(
    TRACKER_ROUTE_PATHS.DOMAINS,
    validateQuery('trackerDomainsQuery', trackerDomainsQuerySchema),
    managementController.listDomains
  );

  router.get(
    TRACKER_ROUTE_PATHS.ROOT,
    validateQuery('trackerListQuery', trackerListQuerySchema),
    managementController.listTrackers
  );

  router.post(
    TRACKER_ROUTE_PATHS.ROOT,
    requireTrackerCreation,
    validate(createTrackerSchema),
    enforcePlanLimit('tracker_capacity'),
    managementController.createTracker
  );

  router.get(TRACKER_ROUTE_PATHS.TRACKER_BY_ID, managementController.getTrackerDetails);

  router.post(
    TRACKER_ROUTE_PATHS.REPORT_TRACKER,
    validate(reportTrackerSchema),
    managementController.reportTracker
  );

  router.patch(
    TRACKER_ROUTE_PATHS.TRACKER_BY_ID,
    validate(updateTrackerSchema),
    managementController.updateTracker
  );

  router.delete(TRACKER_ROUTE_PATHS.TRACKER_BY_ID, managementController.deleteTracker);

  router.post(TRACKER_ROUTE_PATHS.ARCHIVE_TRACKER, managementController.archiveTracker);

  router.post(TRACKER_ROUTE_PATHS.RESTORE_TRACKER, managementController.restoreTracker);

  router.post(
    TRACKER_ROUTE_PATHS.PUBLISH_TRACKER,
    validate(publishTrackerSchema),
    managementController.publishTracker
  );

  router.post(TRACKER_ROUTE_PATHS.UNPUBLISH_TRACKER, managementController.unpublishTracker);

  router.get(TRACKER_ROUTE_PATHS.ROADMAP, roadmapController.getRoadmap);

  router.get(TRACKER_ROUTE_PATHS.ACTIVE_CLAN_CHALLENGE, clanChallengesController.active);
  router.get(TRACKER_ROUTE_PATHS.CLAN, clanController.getOverview);
  router.get(
    TRACKER_ROUTE_PATHS.CLAN_MESSAGES,
    validateQuery('clanMessagesQuery', clanMessagesQuerySchema),
    clanController.listMessages
  );
  router.post(TRACKER_ROUTE_PATHS.CLAN_JOIN, clanController.join);
  router.patch(
    TRACKER_ROUTE_PATHS.CLAN_JOIN_REQUEST,
    validate(reviewClanJoinSchema),
    clanController.reviewJoin
  );
  router.patch(
    TRACKER_ROUTE_PATHS.CLAN_MEMBER,
    validate(updateClanMemberSchema),
    clanController.updateMember
  );
  router.delete(TRACKER_ROUTE_PATHS.CLAN_MEMBER, clanController.removeMember);
  router.delete(TRACKER_ROUTE_PATHS.CLAN_LEAVE, clanController.leave);
  router.post(
    TRACKER_ROUTE_PATHS.CLAN_TRANSFER,
    validate(transferClanOwnershipSchema),
    clanController.transferOwnership
  );
  router.patch(
    TRACKER_ROUTE_PATHS.CLAN_ROLE_INVITATION,
    validate(respondClanRoleInvitationSchema),
    clanController.respondToRoleInvitation
  );
  router.post(TRACKER_ROUTE_PATHS.CLAN_SYNC_CLONE, clanController.syncPersonalClone);
  router.get(TRACKER_ROUTE_PATHS.CLAN_CHALLENGES, clanChallengesController.list);
  router.get(TRACKER_ROUTE_PATHS.CLAN_CHALLENGE, clanChallengesController.get);
  router.get(TRACKER_ROUTE_PATHS.CLAN_CHALLENGE_HISTORY, clanChallengesController.history);
  router.post(
    TRACKER_ROUTE_PATHS.CLAN_CHALLENGES,
    validate(createClanChallengeSchema),
    clanChallengesController.create
  );
  router.post(TRACKER_ROUTE_PATHS.CLAN_CHALLENGE_ACCEPT, clanChallengesController.accept);
  router.post(TRACKER_ROUTE_PATHS.CLAN_CHALLENGE_DECLINE, clanChallengesController.decline);
  router.post(TRACKER_ROUTE_PATHS.CLAN_CHALLENGE_CANCEL, clanChallengesController.cancel);
  router.post(TRACKER_ROUTE_PATHS.CLAN_CHALLENGE_QUIT, clanChallengesController.quit);
  router.post(
    TRACKER_ROUTE_PATHS.CLAN_CHALLENGE_EXTEND,
    validate(extendClanChallengeSchema),
    clanChallengesController.extend
  );
  router.post(
    TRACKER_ROUTE_PATHS.CLAN_CHALLENGE_SUBMIT,
    validate(submitClanChallengeSchema),
    clanChallengesController.submit
  );
  router.post(
    TRACKER_ROUTE_PATHS.CLAN_CHALLENGE_CHECKPOINT,
    validate(chooseClanChallengeCheckpointSchema),
    clanChallengesController.chooseCheckpoint
  );
  router.post(
    TRACKER_ROUTE_PATHS.CLAN_CHALLENGE_ANSWER,
    validate(answerClanChallengeNodeSchema),
    clanChallengesController.answerNode
  );
  router.post(TRACKER_ROUTE_PATHS.CLAN_CHALLENGE_POWER, clanChallengesController.usePower);

  // ─── ROADMAP CONTENT ─────────────────────────────────────────────────────────

  router.post(
    TRACKER_ROUTE_PATHS.TOPICS,
    validate(createTopicSchema),
    roadmapController.createTopic
  );

  router.post(
    TRACKER_ROUTE_PATHS.IMPORT_OUTLINE,
    trackerOutlineUpload.single('file'),
    parseTrackerOutlineUpload,
    validate(importTrackerOutlineSchema),
    roadmapController.importOutline
  );

  router.patch(
    TRACKER_ROUTE_PATHS.TOPIC_BY_ID,
    validate(updateTrackerTopicSchema),
    roadmapController.updateTopic
  );
  router.delete(TRACKER_ROUTE_PATHS.TOPIC_BY_ID, roadmapController.deleteTopic);
  router.delete(TRACKER_ROUTE_PATHS.SUBTOPIC_BY_ID, roadmapController.deleteSubtopic);

  router.post(
    TRACKER_ROUTE_PATHS.SUBTOPICS,
    validate(createSubtopicSchema),
    roadmapController.createSubtopic
  );

  router.post(
    TRACKER_ROUTE_PATHS.CREATE_TOPIC_CONTRIBUTION,
    roadmapController.createTopicContribution
  );

  router.get(TRACKER_ROUTE_PATHS.TOPIC_CONTRIBUTIONS, roadmapController.listTopicContributions);

  router.patch(
    TRACKER_ROUTE_PATHS.REVIEW_TOPIC_CONTRIBUTION,
    validate(reviewTopicContributionSchema),
    roadmapController.reviewTopicContribution
  );

  router.patch(
    TRACKER_ROUTE_PATHS.SUBTOPIC_PROGRESS,
    validate(updateSubtopicProgressSchema),
    roadmapController.updateSubtopicProgress
  );

  router.post(
    TRACKER_ROUTE_PATHS.VERIFY_TOPIC,
    validate(verifyTopicSchema),
    enforcePlanLimit('ai_tutor_request'),
    roadmapController.verifyTopic
  );

  router.post(
    TRACKER_ROUTE_PATHS.VERIFY_SUBTOPIC,
    validate(verifySubtopicSchema),
    enforcePlanLimit('ai_tutor_request'),
    roadmapController.verifySubtopic
  );

  router.post(
    TRACKER_ROUTE_PATHS.ADD_MISSING_EVALUATION_TOPIC,
    roadmapController.addMissingEvaluationTopic
  );

  // ─── LESSONS ─────────────────────────────────────────────────────────────────

  router.get(
    TRACKER_ROUTE_PATHS.LESSON,
    enforcePlanLimit('lesson_generation'),
    lessonsController.getLesson
  );

  router.get(TRACKER_ROUTE_PATHS.LESSON_CHAT, lessonsController.getLessonChatHistory);

  router.post(
    TRACKER_ROUTE_PATHS.LESSON_CHAT,
    validate(lessonChatSchema),
    enforcePlanLimit('ai_tutor_request'),
    lessonsController.chatWithLessonTutor
  );

  router.delete(TRACKER_ROUTE_PATHS.LESSON_CHAT, lessonsController.clearLessonChatHistory);

  router.get(TRACKER_ROUTE_PATHS.LESSON_QUESTIONS, lessonsController.getLessonGeneratedQuestions);

  router.post(
    TRACKER_ROUTE_PATHS.GENERATE_LESSON_QUESTIONS,
    validate(generateLessonQuestionsSchema),
    enforcePlanLimit('ai_tutor_request'),
    lessonsController.generateLessonQuestions
  );

  router.get(
    TRACKER_ROUTE_PATHS.LESSON_QUESTION_SOLUTION,
    validateQuery('lessonQuestionQuery', lessonQuestionSchema),
    lessonsController.getLessonQuestionSolution
  );

  router.post(
    TRACKER_ROUTE_PATHS.GENERATE_LESSON_QUESTION_SOLUTION,
    validate(lessonQuestionSchema),
    enforcePlanLimit('ai_tutor_request'),
    lessonsController.generateLessonQuestionSolution
  );

  router.get(
    TRACKER_ROUTE_PATHS.LESSON_QUESTION_SOLUTION_DOUBTS,
    validateQuery('lessonQuestionQuery', lessonQuestionSchema),
    lessonsController.getLessonQuestionSolutionDoubts
  );

  router.post(
    TRACKER_ROUTE_PATHS.LESSON_QUESTION_SOLUTION_DOUBTS,
    validate(askLessonQuestionSolutionDoubtSchema),
    enforcePlanLimit('ai_tutor_request'),
    lessonsController.askLessonQuestionSolutionDoubt
  );

  router.delete(
    TRACKER_ROUTE_PATHS.LESSON_QUESTION_SOLUTION_DOUBTS,
    validateQuery('lessonQuestionQuery', lessonQuestionSchema),
    lessonsController.clearLessonQuestionSolutionDoubts
  );

  router.post(
    TRACKER_ROUTE_PATHS.LESSON_VISUALIZATION,
    enforcePlanLimit('ai_tutor_request'),
    lessonsController.generateLessonVisualization
  );

  // ─── PRACTICE ────────────────────────────────────────────────────────────────

  router.get(TRACKER_ROUTE_PATHS.LESSON_ANSWER_ATTEMPTS, lessonsController.getLessonAnswerAttempts);

  router.post(
    TRACKER_ROUTE_PATHS.VERIFY_LESSON_ANSWER,
    validate(verifyLessonAnswerSchema),
    enforcePlanLimit('ai_tutor_request'),
    lessonsController.verifyLessonAnswer
  );

  router.get(
    TRACKER_ROUTE_PATHS.LESSON_CODE_SUBMISSIONS,
    lessonsController.getLessonCodeSubmissions
  );

  router.post(
    TRACKER_ROUTE_PATHS.RUN_LESSON_CODE,
    validate(runLessonCodeSchema),
    lessonsController.runLessonCode
  );

  router.post(
    TRACKER_ROUTE_PATHS.SUBMIT_LESSON_CODE,
    validate(submitLessonCodeSchema),
    lessonsController.submitLessonCode
  );

  router.post(
    TRACKER_ROUTE_PATHS.CODE_HINT,
    validate(getCodeHintSchema),
    enforcePlanLimit('ai_tutor_request'),
    lessonsController.getCodeHint
  );

  router.post(
    TRACKER_ROUTE_PATHS.OPTIMIZED_SOLUTION,
    validate(getOptimizedSolutionSchema),
    enforcePlanLimit('ai_tutor_request'),
    lessonsController.getOptimizedSolution
  );

  return router;
};
