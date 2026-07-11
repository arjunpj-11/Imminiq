import type {
  AddMissingEvaluationTopicResult,
  CreatedTrackerSubtopicRecord,
  CreatedTrackerTopicRecord,
  GeneratedTrackerLessonRecord,
  RoadmapTopicNode,
  RunLessonCodeInput,
  SubtopicWithProgressRecord,
  TrackerListFilter,
  TrackerListResult,
  TrackerProgressRecord,
  TrackerRecord,
  TrackerSummaryRecord,
  TrackerSummaryResult,
} from '../../domain/types/trackers.types'
import type { GeneratedLessonData } from '../../domain/types/lesson-practice.types'

export type TrackerListQueryDTO = TrackerListFilter
export type TrackerDTO = TrackerRecord
export type TrackerSummaryDTO = TrackerSummaryRecord | TrackerSummaryResult
export type TrackerListDTO = TrackerListResult
export type TrackerDetailsDTO = TrackerRecord
export type TrackerRoadmapDTO = RoadmapTopicNode[]
export type TrackerTopicDTO = CreatedTrackerTopicRecord
export type TrackerSubtopicDTO = CreatedTrackerSubtopicRecord
export type GeneratedTrackerLessonDTO = GeneratedTrackerLessonRecord | GeneratedLessonData
export type LessonChatHistoryDTO = unknown[]
export type LessonAnswerAttemptsDTO = unknown[]
export type LessonCodeSubmissionsDTO = unknown[]
export type LessonGeneratedQuestionsDTO = unknown
export type LessonQuestionSolutionDTO = unknown
export type LessonQuestionSolutionDoubtsDTO = unknown[]
export type LessonQuestionSolutionDoubtAnswerDTO = unknown
export type LessonAnswerVerificationDTO = unknown
export type LessonCodeExecutionDTO = unknown
export type LessonCodeHintDTO = unknown
export type LessonOptimizedSolutionDTO = unknown
export type LessonVisualizationDTO = unknown
export type TrackerAIValidationDTO = unknown
export type AddMissingEvaluationTopicDTO = AddMissingEvaluationTopicResult
export type RunLessonCodeDTO = RunLessonCodeInput

export type UpdateSubtopicProgressResultDTO = {
  subtopic: SubtopicWithProgressRecord
  progress: TrackerProgressRecord | null
}

export type LessonTutorChatResponseDTO = {
  answer: string
}

export type ClearLessonHistoryResultDTO = {
  success?: boolean
  cleared?: boolean
  deletedCount?: number
}
