import {
  TrackerMapper,
} from './application/mappers/tracker.mapper'
import { AddMissingEvaluationTopicUseCase } from './application/use-cases/add-missing-evaluation-topic.usecase'
import { ArchiveTrackerUseCase } from './application/use-cases/archive-tracker.usecase'
import { AskLessonQuestionSolutionDoubtUseCase } from './application/use-cases/ask-lesson-question-solution-doubt.usecase'
import { ChatWithLessonTutorUseCase } from './application/use-cases/chat-with-lesson-tutor.usecase'
import { ClearLessonChatHistoryUseCase } from './application/use-cases/clear-lesson-chat-history.usecase'
import { ClearLessonQuestionSolutionDoubtsUseCase } from './application/use-cases/clear-lesson-question-solution-doubts.usecase'
import { CreateTrackerSubtopicUseCase } from './application/use-cases/create-tracker-subtopic.usecase'
import { CreateTrackerTopicUseCase } from './application/use-cases/create-tracker-topic.usecase'
import { CreateTrackerUseCase } from './application/use-cases/create-tracker.usecase'
import { DeleteTrackerUseCase } from './application/use-cases/delete-tracker.usecase'
import { GenerateLessonQuestionSolutionUseCase } from './application/use-cases/generate-lesson-question-solution.usecase'
import { GenerateLessonQuestionsUseCase } from './application/use-cases/generate-lesson-questions.usecase'
import { GenerateLessonVisualizationUseCase } from './application/use-cases/generate-lesson-visualization.usecase'
import { GetCodeHintUseCase } from './application/use-cases/get-code-hint.usecase'
import { GetLessonAnswerAttemptsUseCase } from './application/use-cases/get-lesson-answer-attempts.usecase'
import { GetLessonChatHistoryUseCase } from './application/use-cases/get-lesson-chat-history.usecase'
import { GetLessonCodeSubmissionsUseCase } from './application/use-cases/get-lesson-code-submissions.usecase'
import { GetLessonGeneratedQuestionsUseCase } from './application/use-cases/get-lesson-generated-questions.usecase'
import { GetLessonQuestionSolutionDoubtsUseCase } from './application/use-cases/get-lesson-question-solution-doubts.usecase'
import { GetLessonQuestionSolutionUseCase } from './application/use-cases/get-lesson-question-solution.usecase'
import { GetOptimizedSolutionUseCase } from './application/use-cases/get-optimized-solution.usecase'
import { GetTrackerDetailsUseCase } from './application/use-cases/get-tracker-details.usecase'
import { GetTrackerLessonUseCase } from './application/use-cases/get-tracker-lesson.usecase'
import { GetTrackerRoadmapUseCase } from './application/use-cases/get-tracker-roadmap.usecase'
import { GetTrackerSummaryUseCase } from './application/use-cases/get-tracker-summary.usecase'
import { ListTrackersUseCase } from './application/use-cases/list-trackers.usecase'
import { PublishTrackerUseCase } from './application/use-cases/publish-tracker.usecase'
import { RestoreTrackerUseCase } from './application/use-cases/restore-tracker.usecase'
import { RunLessonCodeUseCase } from './application/use-cases/run-lesson-code.usecase'
import { SubmitLessonCodeUseCase } from './application/use-cases/submit-lesson-code.usecase'
import { UnpublishTrackerUseCase } from './application/use-cases/unpublish-tracker.usecase'
import { UpdateSubtopicProgressUseCase } from './application/use-cases/update-subtopic-progress.usecase'
import { UpdateTrackerUseCase } from './application/use-cases/update-tracker.usecase'
import { VerifyLessonAnswerUseCase } from './application/use-cases/verify-lesson-answer.usecase'
import { VerifyTrackerSubtopicUseCase } from './application/use-cases/verify-tracker-subtopic.usecase'
import { VerifyTrackerTopicUseCase } from './application/use-cases/verify-tracker-topic.usecase'
import type { ITrackerRepository } from './domain/repositories/tracker.repository.interface'
import { activityTrackerGateway } from './infrastructure/gateways/activity-tracker.gateway'
import { aiTrackerGateway } from './infrastructure/gateways/ai-tracker.gateway'
import { pistonCodeExecutionGateway } from './infrastructure/gateways/piston-code-execution.gateway'
import { mongoTrackerRepository } from './infrastructure/repositories/mongo-tracker.repository'
import { cryptoQuestionHasher } from './infrastructure/services/crypto-question-hasher.service'

export type TrackerListInput =
  Parameters<ListTrackersUseCase['execute']>[0]

export type CreateTrackerInput =
  Parameters<CreateTrackerUseCase['execute']>[0]

export type UpdateTrackerInput =
  Parameters<UpdateTrackerUseCase['execute']>[0]

export type CreateTopicInput =
  Parameters<CreateTrackerTopicUseCase['execute']>[0]

export type CreateSubtopicInput =
  Parameters<CreateTrackerSubtopicUseCase['execute']>[0]

export type UpdateSubtopicProgressInput =
  Parameters<UpdateSubtopicProgressUseCase['execute']>[0]

export type ChatWithLessonTutorInput =
  Parameters<ChatWithLessonTutorUseCase['execute']>[0]

export type GenerateLessonQuestionsInput =
  Parameters<GenerateLessonQuestionsUseCase['execute']>[0]

export type GetLessonQuestionSolutionInput =
  Parameters<GetLessonQuestionSolutionUseCase['execute']>[0]

export type GenerateLessonQuestionSolutionInput =
  Parameters<
    GenerateLessonQuestionSolutionUseCase['execute']
  >[0]

export type GetLessonQuestionSolutionDoubtsInput =
  Parameters<
    GetLessonQuestionSolutionDoubtsUseCase['execute']
  >[0]

export type AskLessonQuestionSolutionDoubtInput =
  Parameters<
    AskLessonQuestionSolutionDoubtUseCase['execute']
  >[0]

export type VerifyLessonAnswerInput =
  Parameters<VerifyLessonAnswerUseCase['execute']>[0]

export type RunLessonCodeInput =
  Parameters<RunLessonCodeUseCase['execute']>[0]

export type SubmitLessonCodeInput =
  Parameters<SubmitLessonCodeUseCase['execute']>[0]

export type GetCodeHintInput =
  Parameters<GetCodeHintUseCase['execute']>[0]

export type GetOptimizedSolutionInput =
  Parameters<GetOptimizedSolutionUseCase['execute']>[0]

export type ClearLessonQuestionSolutionDoubtsInput =
  Parameters<
    ClearLessonQuestionSolutionDoubtsUseCase['execute']
  >[0]

export type VerifyTopicInput =
  Parameters<VerifyTrackerTopicUseCase['execute']>[0]

export type VerifySubtopicInput =
  Parameters<VerifyTrackerSubtopicUseCase['execute']>[0]

export type AddMissingEvaluationTopicInput =
  Parameters<
    AddMissingEvaluationTopicUseCase['execute']
  >[0]

export type GenerateLessonVisualizationInput =
  Parameters<
    GenerateLessonVisualizationUseCase['execute']
  >[0]

export type PublishTrackerInput =
  Parameters<PublishTrackerUseCase['execute']>[0]

export type TrackerUseCases = {
  getTrackerSummary: GetTrackerSummaryUseCase
  listTrackers: ListTrackersUseCase
  createTracker: CreateTrackerUseCase
  getTrackerDetails: GetTrackerDetailsUseCase
  updateTracker: UpdateTrackerUseCase
  deleteTracker: DeleteTrackerUseCase
  archiveTracker: ArchiveTrackerUseCase
  restoreTracker: RestoreTrackerUseCase
  publishTracker: PublishTrackerUseCase
  unpublishTracker: UnpublishTrackerUseCase
  getTrackerRoadmap: GetTrackerRoadmapUseCase
  createTrackerTopic: CreateTrackerTopicUseCase
  createTrackerSubtopic: CreateTrackerSubtopicUseCase
  updateSubtopicProgress: UpdateSubtopicProgressUseCase
  addMissingEvaluationTopic: AddMissingEvaluationTopicUseCase
  getTrackerLesson: GetTrackerLessonUseCase
  chatWithLessonTutor: ChatWithLessonTutorUseCase
  generateLessonQuestions: GenerateLessonQuestionsUseCase

  generateLessonQuestionSolution:
    GenerateLessonQuestionSolutionUseCase

  askLessonQuestionSolutionDoubt:
    AskLessonQuestionSolutionDoubtUseCase

  generateLessonVisualization:
    GenerateLessonVisualizationUseCase

  getCodeHint: GetCodeHintUseCase
  getOptimizedSolution: GetOptimizedSolutionUseCase
  verifyLessonAnswer: VerifyLessonAnswerUseCase
  verifyTrackerTopic: VerifyTrackerTopicUseCase
  verifyTrackerSubtopic: VerifyTrackerSubtopicUseCase
  runLessonCode: RunLessonCodeUseCase
  submitLessonCode: SubmitLessonCodeUseCase
  getLessonChatHistory: GetLessonChatHistoryUseCase
  getLessonAnswerAttempts: GetLessonAnswerAttemptsUseCase
  getLessonCodeSubmissions: GetLessonCodeSubmissionsUseCase

  getLessonGeneratedQuestions:
    GetLessonGeneratedQuestionsUseCase

  getLessonQuestionSolution:
    GetLessonQuestionSolutionUseCase

  getLessonQuestionSolutionDoubts:
    GetLessonQuestionSolutionDoubtsUseCase

  clearLessonChatHistory:
    ClearLessonChatHistoryUseCase

  clearLessonQuestionSolutionDoubts:
    ClearLessonQuestionSolutionDoubtsUseCase
}

export type TrackerServiceHelpers = {
  trackerRepository: ITrackerRepository
}

export type TrackerComposition = {
  useCases: TrackerUseCases
  helpers: TrackerServiceHelpers
}

export const createTrackerComposition =
  (): TrackerComposition => {
    const trackerRepository =
      mongoTrackerRepository

    const trackerActivityRecorder =
      activityTrackerGateway

    const trackerAIGateway =
      aiTrackerGateway

    const trackerCodeExecutor =
      pistonCodeExecutionGateway

    const trackerQuestionHasher =
      cryptoQuestionHasher

    const _trackerMapper =
      new TrackerMapper()

    return {
      useCases: {
        getTrackerSummary:
          new GetTrackerSummaryUseCase(
            trackerRepository,
            _trackerMapper,
          ),

        listTrackers:
          new ListTrackersUseCase(
            trackerRepository,
            _trackerMapper,
          ),

        createTracker:
          new CreateTrackerUseCase(
            trackerRepository,
            _trackerMapper,
          ),

        getTrackerDetails:
          new GetTrackerDetailsUseCase(
            trackerRepository,
            _trackerMapper,
          ),

        updateTracker:
          new UpdateTrackerUseCase(
            trackerRepository,
            _trackerMapper,
          ),

        deleteTracker:
          new DeleteTrackerUseCase(
            trackerRepository,
            _trackerMapper,
          ),

        archiveTracker:
          new ArchiveTrackerUseCase(
            trackerRepository,
            _trackerMapper,
          ),

        restoreTracker:
          new RestoreTrackerUseCase(
            trackerRepository,
            _trackerMapper,
          ),

        publishTracker:
          new PublishTrackerUseCase(
            trackerRepository,
            _trackerMapper,
          ),

        unpublishTracker:
          new UnpublishTrackerUseCase(
            trackerRepository,
            _trackerMapper,
          ),

        getTrackerRoadmap:
          new GetTrackerRoadmapUseCase(
            trackerRepository,
            _trackerMapper,
          ),

        createTrackerTopic:
          new CreateTrackerTopicUseCase(
            trackerRepository,
            _trackerMapper,
          ),

        createTrackerSubtopic:
          new CreateTrackerSubtopicUseCase(
            trackerRepository,
            _trackerMapper,
          ),

        updateSubtopicProgress:
          new UpdateSubtopicProgressUseCase(
            trackerRepository,
            trackerActivityRecorder,
            _trackerMapper,
          ),

        addMissingEvaluationTopic:
          new AddMissingEvaluationTopicUseCase(
            trackerRepository,
            _trackerMapper,
          ),

        getTrackerLesson:
          new GetTrackerLessonUseCase(
            trackerRepository,
            trackerAIGateway,
            _trackerMapper,
          ),

        chatWithLessonTutor:
          new ChatWithLessonTutorUseCase(
            trackerRepository,
            trackerAIGateway,
            _trackerMapper,
          ),

        generateLessonQuestions:
          new GenerateLessonQuestionsUseCase(
            trackerRepository,
            trackerAIGateway,
            trackerQuestionHasher,
            _trackerMapper,
          ),

        generateLessonQuestionSolution:
          new GenerateLessonQuestionSolutionUseCase(
            trackerRepository,
            trackerAIGateway,
            trackerQuestionHasher,
            _trackerMapper,
          ),

        askLessonQuestionSolutionDoubt:
          new AskLessonQuestionSolutionDoubtUseCase(
            trackerRepository,
            trackerAIGateway,
            trackerQuestionHasher,
            _trackerMapper,
          ),

        generateLessonVisualization:
          new GenerateLessonVisualizationUseCase(
            trackerRepository,
            trackerAIGateway,
            _trackerMapper,
          ),

        getCodeHint:
          new GetCodeHintUseCase(
            trackerRepository,
            trackerAIGateway,
            _trackerMapper,
          ),

        getOptimizedSolution:
          new GetOptimizedSolutionUseCase(
            trackerRepository,
            trackerAIGateway,
            _trackerMapper,
          ),

        verifyLessonAnswer:
          new VerifyLessonAnswerUseCase(
            trackerRepository,
            trackerAIGateway,
            _trackerMapper,
          ),

        verifyTrackerTopic:
          new VerifyTrackerTopicUseCase(
            trackerRepository,
            trackerAIGateway,
            _trackerMapper,
          ),

        verifyTrackerSubtopic:
          new VerifyTrackerSubtopicUseCase(
            trackerRepository,
            trackerAIGateway,
            _trackerMapper,
          ),

        runLessonCode:
          new RunLessonCodeUseCase(
            trackerRepository,
            trackerCodeExecutor,
            _trackerMapper,
          ),

        submitLessonCode:
          new SubmitLessonCodeUseCase(
            trackerRepository,
            trackerCodeExecutor,
            _trackerMapper,
          ),

        getLessonChatHistory:
          new GetLessonChatHistoryUseCase(
            trackerRepository,
            _trackerMapper,
          ),

        getLessonAnswerAttempts:
          new GetLessonAnswerAttemptsUseCase(
            trackerRepository,
            _trackerMapper,
          ),

        getLessonCodeSubmissions:
          new GetLessonCodeSubmissionsUseCase(
            trackerRepository,
            _trackerMapper,
          ),

        getLessonGeneratedQuestions:
          new GetLessonGeneratedQuestionsUseCase(
            trackerRepository,
            _trackerMapper,
          ),

        getLessonQuestionSolution:
          new GetLessonQuestionSolutionUseCase(
            trackerRepository,
            trackerQuestionHasher,
            _trackerMapper,
          ),

        getLessonQuestionSolutionDoubts:
          new GetLessonQuestionSolutionDoubtsUseCase(
            trackerRepository,
            trackerQuestionHasher,
            _trackerMapper,
          ),

        clearLessonChatHistory:
          new ClearLessonChatHistoryUseCase(
            trackerRepository,
            _trackerMapper,
          ),

        clearLessonQuestionSolutionDoubts:
          new ClearLessonQuestionSolutionDoubtsUseCase(
            trackerRepository,
            trackerQuestionHasher,
            _trackerMapper,
          ),
      },

      helpers: {
        trackerRepository,
      },
    }
  }