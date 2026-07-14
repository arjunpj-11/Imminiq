import type { ITrackerCommandRepository } from './tracker-command.repository.interface';
import type { ITrackerContentRepository } from './tracker-content.repository.interface';
import type { ITrackerLessonRepository } from './tracker-lesson.repository.interface';
import type { ITrackerProgressRepository } from './tracker-progress.repository.interface';
import type { ITrackerQueryRepository } from './tracker-query.repository.interface';

export interface ITrackerRepository
  extends
    ITrackerQueryRepository,
    ITrackerCommandRepository,
    ITrackerContentRepository,
    ITrackerProgressRepository,
    ITrackerLessonRepository {}

export type {
  ArchiveOwnedTrackerInput,
  RestoreOwnedTrackerInput,
  SoftDeleteOwnedTrackerInput,
  TrackerOwnerInput,
  UnpublishOwnedTrackerInput,
} from './tracker-command.repository.interface';

export type {
  FindEvaluationJobByIdInput,
  FindLastSiblingSubtopicInput,
  MarkMissingEvaluationTopicAsAddedInput,
  ShiftTopicOrdersFromInput,
} from './tracker-content.repository.interface';

export type {
  ClearLessonChatMessagesInput,
  ClearLessonQuestionSolutionDoubtsInput,
  CreateLessonAnswerAttemptInput,
  CreateLessonChatMessageInput,
  CreateLessonCodeSubmissionInput,
  CreateLessonGeneratedQuestionsInput,
  CreateLessonQuestionSolutionDoubtInput,
  CreateLessonQuestionSolutionInput,
  CreateTrackerLessonInput,
  FindLessonQuestionSolutionInput,
  FindLessonVisualizationInput,
  GetLessonAnswerAttemptsInput,
  GetLessonChatMessagesInput,
  GetLessonCodeSubmissionsInput,
  GetLessonGeneratedQuestionsInput,
  GetLessonQuestionSolutionDoubtsInput,
  LessonChatScope,
  LessonCodeAction,
  LessonGeneratedQuestionInput,
  LessonVisualizationRecord,
  SaveLessonVisualizationInput,
  TrackerLessonCodeExample,
  TrackerLessonCompilerRuntime,
  TrackerLessonDifficulty,
  TrackerLessonType,
} from './tracker-lesson.repository.interface';

export type {
  CheckAndCompleteParentSubtopicInput,
  CheckAndCompleteTopicAndUnlockNextInput,
  EnsureUserProgressInitializedInput,
  GetUserSubtopicsProgressInput,
  GetUserTopicsProgressInput,
  ParentSubtopicCompletionResult,
  RecomputeTrackerProgressInput,
  TopicCompletionResult,
  TrackerProgressUpdateResult,
  UnlockNextSubtopicInput,
  UnlockNextSubtopicResult,
  UpdateSubtopicProgressResult,
} from './tracker-progress.repository.interface';

export type {
  FindGeneratedLessonBySubtopicInput,
  FindLessonBySubtopicIdInput,
  FindOwnedTrackerByIdInput,
  GetSubtopicByIdInput,
  GetSubtopicsWithUserProgressInput,
  GetTopicsWithUserProgressInput,
} from './tracker-query.repository.interface';
