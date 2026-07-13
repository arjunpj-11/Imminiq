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
} from '../domain/trackers.types'
import type { GeneratedLessonData } from '../domain/lesson-practice.types'
import type {
  LessonAnswerAttemptRecord,
  LessonChatMessageRecord,
  LessonCodeSubmissionRecord,
  LessonGeneratedQuestionRecord,
  LessonQuestionSolutionDoubtRecord,
  LessonQuestionSolutionRecord,
  LessonVisualizationRecord,
} from '../domain/repositories/tracker-lesson.repository.interface'
import type {
  CodeExecutionResult,
  CodeSubmissionResult,
} from '../domain/services/code-execution.interface'
import type {
  AnswerVerificationResult,
  LessonCodeHintAIResult,
  OptimizedCodeSolution,
  TrackerValidationResult,
} from '../domain/services/tracker-ai.interface'

export type TrackerListQueryDTO = TrackerListFilter
export type TrackerDTO = TrackerRecord
export type TrackerSummaryDTO = TrackerSummaryRecord | TrackerSummaryResult
export type TrackerListDTO = TrackerListResult
export type TrackerDetailsDTO = TrackerRecord
export type TrackerRoadmapDTO = RoadmapTopicNode[]
export type TrackerTopicDTO = CreatedTrackerTopicRecord
export type TrackerSubtopicDTO = CreatedTrackerSubtopicRecord
export type GeneratedTrackerLessonDTO = GeneratedTrackerLessonRecord | GeneratedLessonData
export type LessonChatHistoryDTO = LessonChatMessageRecord[]
export type LessonAnswerAttemptsDTO = LessonAnswerAttemptRecord[]
export type LessonCodeSubmissionsDTO = LessonCodeSubmissionRecord[]
export type LessonGeneratedQuestionsDTO = LessonGeneratedQuestionRecord[]
export type LessonQuestionSolutionDTO = LessonQuestionSolutionRecord | null
export type LessonQuestionSolutionDoubtsDTO = LessonQuestionSolutionDoubtRecord[]
export type LessonQuestionSolutionDoubtAnswerDTO = { answer: string }
export type LessonAnswerVerificationDTO = AnswerVerificationResult
export type LessonCodeExecutionDTO = CodeExecutionResult
export type LessonCodeSubmissionDTO = CodeSubmissionResult
export type LessonCodeHintDTO = LessonCodeHintAIResult & { hintCount: number }
export type LessonOptimizedSolutionDTO = OptimizedCodeSolution
export type LessonVisualizationDTO = LessonVisualizationRecord
export type TrackerAIValidationDTO = TrackerValidationResult
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
