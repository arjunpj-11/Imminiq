import type { TrackerCommandRepositoryContract } from './tracker-command.repository.interface'
import type { TrackerContentRepositoryContract } from './tracker-content.repository.interface'
import type { TrackerLessonRepositoryContract } from './tracker-lesson.repository.interface'
import type { TrackerProgressRepositoryContract } from './tracker-progress.repository.interface'
import type { TrackerQueryRepositoryContract } from './tracker-query.repository.interface'

export interface TrackerRepositoryContract
  extends TrackerQueryRepositoryContract,
    TrackerCommandRepositoryContract,
    TrackerContentRepositoryContract,
    TrackerProgressRepositoryContract,
    TrackerLessonRepositoryContract {}

export type {
  ArchiveOwnedTrackerInput,
  RestoreOwnedTrackerInput,
  SoftDeleteOwnedTrackerInput,
  TrackerOwnerInput,
  UnpublishOwnedTrackerInput,
} from './tracker-command.repository.interface'

export type {
  FindEvaluationJobByIdInput,
  FindLastSiblingSubtopicInput,
  MarkMissingEvaluationTopicAsAddedInput,
  ShiftTopicOrdersFromInput,
} from './tracker-content.repository.interface'

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
} from './tracker-lesson.repository.interface'

export type {
  CheckAndCompleteParentSubtopicInput,
  CheckAndCompleteTopicAndUnlockNextInput,
  EnsureUserProgressInitializedInput,
  GetUserSubtopicsProgressInput,
  GetUserTopicsProgressInput,
  RecomputeTrackerProgressInput,
  UnlockNextSubtopicInput,
} from './tracker-progress.repository.interface'

export type {
  FindGeneratedLessonBySubtopicInput,
  FindLessonBySubtopicIdInput,
  FindOwnedTrackerByIdInput,
  GetSubtopicByIdInput,
  GetSubtopicsWithUserProgressInput,
  GetTopicsWithUserProgressInput,
} from './tracker-query.repository.interface'