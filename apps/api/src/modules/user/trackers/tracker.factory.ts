import type { TrackerUseCases } from './application/tracker-use-cases.contract';
import { TrackerMapper } from './application/tracker.mapper';
import { MissingEvaluationTopicPlacementService } from './application/services/missing-evaluation-topic-placement.service';
import { AddMissingEvaluationTopicUseCase } from './application/use-cases/add-missing-evaluation-topic.usecase';
import { ArchiveTrackerUseCase } from './application/use-cases/archive-tracker.usecase';
import { AskLessonQuestionSolutionDoubtUseCase } from './application/use-cases/ask-lesson-question-solution-doubt.usecase';
import { ChatWithLessonTutorUseCase } from './application/use-cases/chat-with-lesson-tutor.usecase';
import { ClearLessonChatHistoryUseCase } from './application/use-cases/clear-lesson-chat-history.usecase';
import { ClearLessonQuestionSolutionDoubtsUseCase } from './application/use-cases/clear-lesson-question-solution-doubts.usecase';
import { CreateTrackerSubtopicUseCase } from './application/use-cases/create-tracker-subtopic.usecase';
import { CreateTrackerTopicUseCase } from './application/use-cases/create-tracker-topic.usecase';
import { ImportTrackerOutlineUseCase } from './application/use-cases/import-tracker-outline.usecase';
import { CreateTrackerUseCase } from './application/use-cases/create-tracker.usecase';
import { CreateTopicContributionUseCase } from './application/use-cases/create-topic-contribution.usecase';
import { DeleteTrackerUseCase } from './application/use-cases/delete-tracker.usecase';
import { GenerateLessonQuestionSolutionUseCase } from './application/use-cases/generate-lesson-question-solution.usecase';
import { GenerateLessonQuestionsUseCase } from './application/use-cases/generate-lesson-questions.usecase';
import { GenerateLessonVisualizationUseCase } from './application/use-cases/generate-lesson-visualization.usecase';
import { GetCodeHintUseCase } from './application/use-cases/get-code-hint.usecase';
import { GetLessonAnswerAttemptsUseCase } from './application/use-cases/get-lesson-answer-attempts.usecase';
import { GetLessonChatHistoryUseCase } from './application/use-cases/get-lesson-chat-history.usecase';
import { GetLessonCodeSubmissionsUseCase } from './application/use-cases/get-lesson-code-submissions.usecase';
import { GetLessonGeneratedQuestionsUseCase } from './application/use-cases/get-lesson-generated-questions.usecase';
import { GetLessonQuestionSolutionDoubtsUseCase } from './application/use-cases/get-lesson-question-solution-doubts.usecase';
import { GetLessonQuestionSolutionUseCase } from './application/use-cases/get-lesson-question-solution.usecase';
import { GetOptimizedSolutionUseCase } from './application/use-cases/get-optimized-solution.usecase';
import { GetTrackerDetailsUseCase } from './application/use-cases/get-tracker-details.usecase';
import { GetTrackerLessonUseCase } from './application/use-cases/get-tracker-lesson.usecase';
import { GetTrackerRoadmapUseCase } from './application/use-cases/get-tracker-roadmap.usecase';
import { GetTrackerSummaryUseCase } from './application/use-cases/get-tracker-summary.usecase';
import { ListTrackersUseCase } from './application/use-cases/list-trackers.usecase';
import { ListTrackerDomainsUseCase } from './application/use-cases/list-tracker-domains.usecase';
import { ListTopicContributionsUseCase } from './application/use-cases/list-topic-contributions.usecase';
import { PublishTrackerUseCase } from './application/use-cases/publish-tracker.usecase';
import { RestoreTrackerUseCase } from './application/use-cases/restore-tracker.usecase';
import { ReviewTopicContributionUseCase } from './application/use-cases/review-topic-contribution.usecase';
import { ReportTrackerUseCase } from './application/use-cases/report-tracker.usecase';
import { RunLessonCodeUseCase } from './application/use-cases/run-lesson-code.usecase';
import { SubmitLessonCodeUseCase } from './application/use-cases/submit-lesson-code.usecase';
import { UnpublishTrackerUseCase } from './application/use-cases/unpublish-tracker.usecase';
import { UpdateSubtopicProgressUseCase } from './application/use-cases/update-subtopic-progress.usecase';
import { UpdateTrackerUseCase } from './application/use-cases/update-tracker.usecase';
import { VerifyLessonAnswerUseCase } from './application/use-cases/verify-lesson-answer.usecase';
import { VerifyTrackerSubtopicUseCase } from './application/use-cases/verify-tracker-subtopic.usecase';
import { VerifyTrackerTopicUseCase } from './application/use-cases/verify-tracker-topic.usecase';
import { TrackerClanService } from './application/services/tracker-clan.service';
import { TrackerClanNotificationService } from './application/services/tracker-clan-notification.service';
import { TrackerClanChallengeService } from './application/services/tracker-clan-challenge.service';
import type { ITrackerRepository } from './domain/repositories/tracker.repository.interface';
import { mongoPlatformPolicyReader } from '../../../infrastructure/mongo-platform-policy.reader';
import { ActivityTrackerGateway } from './infrastructure/gateways/activity-tracker.gateway';
import type { IRecordUserActivityUseCase } from '../activity';
import type { ICreateNotificationUseCase } from '../../notifications';
import { aiTrackerGateway } from './infrastructure/gateways/ai-tracker.gateway';
import { pistonCodeExecutionGateway } from './infrastructure/gateways/piston-code-execution.gateway';
import { mongoTrackerRepository } from './infrastructure/repositories/mongo-tracker.repository';
import { cryptoQuestionHasher } from './infrastructure/services/crypto-question-hasher.service';
import { mongoTrackerTopicContributionRepository } from './infrastructure/repositories/mongo-tracker-topic-contribution.repository';
import { TrackerContributionNotificationGateway } from './infrastructure/gateways/tracker-contribution-notification.gateway';
import { trackerClanChallengeGateway } from './infrastructure/gateways/tracker-clan-challenge.gateway';
import { trackerClanChallengeQuestionGateway } from './infrastructure/gateways/tracker-clan-challenge-question.gateway';
import { TrackerClanNotificationGateway } from './infrastructure/gateways/tracker-clan-notification.gateway';
import { MongoTrackerClanRepository } from './infrastructure/repositories/mongo-tracker-clan.repository';
import type { ITrackerPersonalCloneProvisioner } from './domain/services/tracker-personal-clone-provisioner.interface';

export type TrackerServiceHelpers = {
  trackerRepository: ITrackerRepository;
};

export type TrackerComposition = {
  useCases: TrackerUseCases;
  helpers: TrackerServiceHelpers;
};

export const createTrackerComposition = (
  activityRecorder: IRecordUserActivityUseCase,
  notificationCreator: ICreateNotificationUseCase,
  personalCloneProvisioner: ITrackerPersonalCloneProvisioner
): TrackerComposition => {
  const trackerRepository = mongoTrackerRepository;

  const trackerActivityRecorder = new ActivityTrackerGateway(activityRecorder);

  const trackerAIGateway = aiTrackerGateway;

  const trackerCodeExecutor = pistonCodeExecutionGateway;

  const trackerQuestionHasher = cryptoQuestionHasher;
  const contributionNotifier = new TrackerContributionNotificationGateway(notificationCreator);
  const trackerClanNotifications = new TrackerClanNotificationGateway(notificationCreator);
  const trackerClanRepository = new MongoTrackerClanRepository(personalCloneProvisioner);

  const trackerMapper = new TrackerMapper();
  const missingEvaluationTopicPlacement = new MissingEvaluationTopicPlacementService(
    trackerRepository
  );
  const createTrackerTopic = new CreateTrackerTopicUseCase(trackerRepository, trackerMapper);
  const createTrackerSubtopic = new CreateTrackerSubtopicUseCase(trackerRepository, trackerMapper);

  return {
    useCases: {
      getTrackerSummary: new GetTrackerSummaryUseCase(trackerRepository, trackerMapper),

      listTrackers: new ListTrackersUseCase(trackerRepository, trackerMapper),

      listTrackerDomains: new ListTrackerDomainsUseCase(trackerRepository),

      createTracker: new CreateTrackerUseCase(trackerRepository, trackerMapper),

      getTrackerDetails: new GetTrackerDetailsUseCase(trackerRepository, trackerMapper),

      updateTracker: new UpdateTrackerUseCase(trackerRepository, trackerMapper),

      deleteTracker: new DeleteTrackerUseCase(trackerRepository, trackerMapper),

      archiveTracker: new ArchiveTrackerUseCase(trackerRepository, trackerMapper),

      restoreTracker: new RestoreTrackerUseCase(trackerRepository, trackerMapper),

      publishTracker: new PublishTrackerUseCase(trackerRepository, trackerMapper),

      unpublishTracker: new UnpublishTrackerUseCase(trackerRepository, trackerMapper),

      reportTracker: new ReportTrackerUseCase(trackerRepository),

      trackerClan: new TrackerClanService(
        trackerClanRepository,
        new TrackerClanNotificationService(trackerClanNotifications)
      ),

      trackerClanChallenges: new TrackerClanChallengeService(
        trackerClanRepository,
        trackerClanChallengeQuestionGateway,
        trackerClanChallengeGateway,
        trackerClanNotifications
      ),

      getTrackerRoadmap: new GetTrackerRoadmapUseCase(trackerRepository, trackerMapper),

      createTrackerTopic,

      createTrackerSubtopic,

      importTrackerOutline: new ImportTrackerOutlineUseCase(
        createTrackerTopic,
        createTrackerSubtopic
      ),

      createTopicContribution: new CreateTopicContributionUseCase(
        mongoTrackerTopicContributionRepository,
        contributionNotifier
      ),

      listTopicContributions: new ListTopicContributionsUseCase(
        mongoTrackerTopicContributionRepository
      ),

      reviewTopicContribution: new ReviewTopicContributionUseCase(
        mongoTrackerTopicContributionRepository,
        contributionNotifier
      ),

      updateSubtopicProgress: new UpdateSubtopicProgressUseCase(
        trackerRepository,
        trackerActivityRecorder,
        trackerMapper,
        mongoPlatformPolicyReader
      ),

      addMissingEvaluationTopic: new AddMissingEvaluationTopicUseCase(
        trackerRepository,
        missingEvaluationTopicPlacement,
        trackerMapper
      ),

      getTrackerLesson: new GetTrackerLessonUseCase(
        trackerRepository,
        trackerAIGateway,
        trackerMapper
      ),

      chatWithLessonTutor: new ChatWithLessonTutorUseCase(
        trackerRepository,
        trackerAIGateway,
        trackerMapper
      ),

      generateLessonQuestions: new GenerateLessonQuestionsUseCase(
        trackerRepository,
        trackerAIGateway,
        trackerQuestionHasher,
        trackerMapper
      ),

      generateLessonQuestionSolution: new GenerateLessonQuestionSolutionUseCase(
        trackerRepository,
        trackerAIGateway,
        trackerQuestionHasher,
        trackerMapper
      ),

      askLessonQuestionSolutionDoubt: new AskLessonQuestionSolutionDoubtUseCase(
        trackerRepository,
        trackerAIGateway,
        trackerQuestionHasher,
        trackerMapper
      ),

      generateLessonVisualization: new GenerateLessonVisualizationUseCase(
        trackerRepository,
        trackerAIGateway,
        trackerMapper
      ),

      getCodeHint: new GetCodeHintUseCase(trackerRepository, trackerAIGateway, trackerMapper),

      getOptimizedSolution: new GetOptimizedSolutionUseCase(
        trackerRepository,
        trackerAIGateway,
        trackerMapper
      ),

      verifyLessonAnswer: new VerifyLessonAnswerUseCase(
        trackerRepository,
        trackerAIGateway,
        trackerMapper
      ),

      verifyTrackerTopic: new VerifyTrackerTopicUseCase(
        trackerRepository,
        trackerAIGateway,
        trackerMapper
      ),

      verifyTrackerSubtopic: new VerifyTrackerSubtopicUseCase(
        trackerRepository,
        trackerAIGateway,
        trackerMapper
      ),

      runLessonCode: new RunLessonCodeUseCase(
        trackerRepository,
        trackerCodeExecutor,
        trackerMapper
      ),

      submitLessonCode: new SubmitLessonCodeUseCase(
        trackerRepository,
        trackerCodeExecutor,
        trackerMapper
      ),

      getLessonChatHistory: new GetLessonChatHistoryUseCase(trackerRepository, trackerMapper),

      getLessonAnswerAttempts: new GetLessonAnswerAttemptsUseCase(
        trackerRepository,
        trackerMapper
      ),

      getLessonCodeSubmissions: new GetLessonCodeSubmissionsUseCase(
        trackerRepository,
        trackerMapper
      ),

      getLessonGeneratedQuestions: new GetLessonGeneratedQuestionsUseCase(
        trackerRepository,
        trackerMapper
      ),

      getLessonQuestionSolution: new GetLessonQuestionSolutionUseCase(
        trackerRepository,
        trackerQuestionHasher,
        trackerMapper
      ),

      getLessonQuestionSolutionDoubts: new GetLessonQuestionSolutionDoubtsUseCase(
        trackerRepository,
        trackerQuestionHasher,
        trackerMapper
      ),

      clearLessonChatHistory: new ClearLessonChatHistoryUseCase(trackerRepository, trackerMapper),

      clearLessonQuestionSolutionDoubts: new ClearLessonQuestionSolutionDoubtsUseCase(
        trackerRepository,
        trackerQuestionHasher,
        trackerMapper
      ),
    },

    helpers: {
      trackerRepository,
    },
  };
};
