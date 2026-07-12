import type {
  AddMissingEvaluationTopicDTO,
  ClearLessonHistoryResultDTO,

  LessonAnswerAttemptsDTO,
  LessonAnswerVerificationDTO,
  LessonChatHistoryDTO,
  LessonCodeExecutionDTO,
  LessonCodeHintDTO,
  LessonCodeSubmissionsDTO,
  LessonGeneratedQuestionsDTO,
  LessonOptimizedSolutionDTO,
  LessonQuestionSolutionDoubtAnswerDTO,
  LessonQuestionSolutionDoubtsDTO,
  LessonQuestionSolutionDTO,
  LessonTutorChatResponseDTO,
  LessonVisualizationDTO,
  TrackerAIValidationDTO,
  TrackerDetailsDTO,
  TrackerDTO,
  TrackerListDTO,
  TrackerSubtopicDTO,
  TrackerSummaryDTO,
  TrackerTopicDTO,
  UpdateSubtopicProgressResultDTO,
} from './tracker.dto'
import type {
  AddMissingEvaluationTopicResult,
  CreatedTrackerSubtopicRecord,
  CreatedTrackerTopicRecord,
  SubtopicWithProgressRecord,
  TrackerListResult,
  TrackerProgressRecord,
  TrackerRecord,
  TrackerSummaryRecord,
  TrackerSummaryResult,
} from '../domain/trackers.types'


export interface ITrackerMapper {
  toTrackerDto(tracker: TrackerRecord): TrackerDTO
  toTrackerDetailsDto(tracker: TrackerRecord): TrackerDetailsDTO
  toTrackerSummaryDto(summary: TrackerSummaryRecord | TrackerSummaryResult): TrackerSummaryDTO
  toTrackerListDto(result: TrackerListResult): TrackerListDTO
  toTrackerRoadmapDto<T>(roadmap: T): T
  toTrackerTopicDto(topic: CreatedTrackerTopicRecord): TrackerTopicDTO
  toTrackerSubtopicDto(subtopic: CreatedTrackerSubtopicRecord): TrackerSubtopicDTO
  toSubtopicProgressResultDto(result: {
    subtopic: SubtopicWithProgressRecord
    progress: TrackerProgressRecord | null
  }): UpdateSubtopicProgressResultDTO
  toGeneratedLessonDto<T>(lesson: T): T
  toLessonChatHistoryDto(history: unknown[]): LessonChatHistoryDTO
  toLessonTutorChatResponseDto(response: { answer: string }): LessonTutorChatResponseDTO
  toLessonGeneratedQuestionsDto(result: unknown): LessonGeneratedQuestionsDTO
  toLessonQuestionSolutionDto(result: unknown): LessonQuestionSolutionDTO
  toLessonQuestionSolutionDoubtsDto(result: unknown[]): LessonQuestionSolutionDoubtsDTO
  toLessonQuestionSolutionDoubtAnswerDto(result: unknown): LessonQuestionSolutionDoubtAnswerDTO
  toLessonAnswerAttemptsDto(result: unknown[]): LessonAnswerAttemptsDTO
  toLessonAnswerVerificationDto(result: unknown): LessonAnswerVerificationDTO
  toLessonCodeSubmissionsDto(result: unknown[]): LessonCodeSubmissionsDTO
  toLessonCodeExecutionDto(result: unknown): LessonCodeExecutionDTO
  toLessonCodeHintDto(result: unknown): LessonCodeHintDTO
  toLessonOptimizedSolutionDto(result: unknown): LessonOptimizedSolutionDTO
  toLessonVisualizationDto(result: unknown): LessonVisualizationDTO
  toTrackerAIValidationDto(result: unknown): TrackerAIValidationDTO
  toAddMissingEvaluationTopicDto(result: AddMissingEvaluationTopicResult): AddMissingEvaluationTopicDTO
  toClearLessonHistoryResultDto(result: unknown): ClearLessonHistoryResultDTO
}

export class TrackerMapper implements ITrackerMapper {
  toTrackerDto(tracker: TrackerRecord): TrackerDTO {
    return tracker
  }

  toTrackerDetailsDto(tracker: TrackerRecord): TrackerDetailsDTO {
    return tracker
  }

  toTrackerSummaryDto(
    summary: TrackerSummaryRecord | TrackerSummaryResult
  ): TrackerSummaryDTO {
    return summary
  }

  toTrackerListDto(result: TrackerListResult): TrackerListDTO {
    return result
  }

  toTrackerRoadmapDto<T>(roadmap: T): T {
    return roadmap
  }

  toTrackerTopicDto(topic: CreatedTrackerTopicRecord): TrackerTopicDTO {
    return topic
  }

  toTrackerSubtopicDto(subtopic: CreatedTrackerSubtopicRecord): TrackerSubtopicDTO {
    return subtopic
  }

  toSubtopicProgressResultDto(result: {
    subtopic: SubtopicWithProgressRecord
    progress: TrackerProgressRecord | null
  }): UpdateSubtopicProgressResultDTO {
    return result
  }

  toGeneratedLessonDto<T>(lesson: T): T {
    return lesson
  }

  toLessonChatHistoryDto(history: unknown[]): LessonChatHistoryDTO {
    return history
  }

  toLessonTutorChatResponseDto(response: { answer: string }): LessonTutorChatResponseDTO {
    return response
  }

  toLessonGeneratedQuestionsDto(result: unknown): LessonGeneratedQuestionsDTO {
    return result
  }

  toLessonQuestionSolutionDto(result: unknown): LessonQuestionSolutionDTO {
    return result
  }

  toLessonQuestionSolutionDoubtsDto(result: unknown[]): LessonQuestionSolutionDoubtsDTO {
    return result
  }

  toLessonQuestionSolutionDoubtAnswerDto(
    result: unknown
  ): LessonQuestionSolutionDoubtAnswerDTO {
    return result
  }

  toLessonAnswerAttemptsDto(result: unknown[]): LessonAnswerAttemptsDTO {
    return result
  }

  toLessonAnswerVerificationDto(result: unknown): LessonAnswerVerificationDTO {
    return result
  }

  toLessonCodeSubmissionsDto(result: unknown[]): LessonCodeSubmissionsDTO {
    return result
  }

  toLessonCodeExecutionDto(result: unknown): LessonCodeExecutionDTO {
    return result
  }

  toLessonCodeHintDto(result: unknown): LessonCodeHintDTO {
    return result
  }

  toLessonOptimizedSolutionDto(result: unknown): LessonOptimizedSolutionDTO {
    return result
  }

  toLessonVisualizationDto(result: unknown): LessonVisualizationDTO {
    return result
  }

  toTrackerAIValidationDto(result: unknown): TrackerAIValidationDTO {
    return result
  }

  toAddMissingEvaluationTopicDto(
    result: AddMissingEvaluationTopicResult
  ): AddMissingEvaluationTopicDTO {
    return result
  }

  toClearLessonHistoryResultDto(result: unknown): ClearLessonHistoryResultDTO {
    return result as ClearLessonHistoryResultDTO
  }
}
