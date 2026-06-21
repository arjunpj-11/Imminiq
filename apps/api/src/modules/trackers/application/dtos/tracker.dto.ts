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

export type TrackerListQueryDto = TrackerListFilter
export type TrackerDto = TrackerRecord
export type TrackerSummaryDto = TrackerSummaryRecord | TrackerSummaryResult
export type TrackerListDto = TrackerListResult
export type TrackerDetailsDto = TrackerRecord
export type TrackerRoadmapDto = RoadmapTopicNode[]
export type TrackerTopicDto = CreatedTrackerTopicRecord
export type TrackerSubtopicDto = CreatedTrackerSubtopicRecord
export type GeneratedTrackerLessonDto = GeneratedTrackerLessonRecord | GeneratedLessonData
export type LessonChatHistoryDto = unknown[]
export type LessonAnswerAttemptsDto = unknown[]
export type LessonCodeSubmissionsDto = unknown[]
export type LessonGeneratedQuestionsDto = unknown
export type LessonQuestionSolutionDto = unknown
export type LessonQuestionSolutionDoubtsDto = unknown[]
export type LessonQuestionSolutionDoubtAnswerDto = unknown
export type LessonAnswerVerificationDto = unknown
export type LessonCodeExecutionDto = unknown
export type LessonCodeHintDto = unknown
export type LessonOptimizedSolutionDto = unknown
export type LessonVisualizationDto = unknown
export type TrackerAIValidationDto = unknown
export type AddMissingEvaluationTopicDto = AddMissingEvaluationTopicResult
export type RunLessonCodeDto = RunLessonCodeInput

export type UpdateSubtopicProgressResultDto = {
  subtopic: SubtopicWithProgressRecord
  progress: TrackerProgressRecord | null
}

export type LessonTutorChatResponseDto = {
  answer: string
}

export type ClearLessonHistoryResultDto = {
  success?: boolean
  cleared?: boolean
  deletedCount?: number
}
