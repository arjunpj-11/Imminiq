import type {
  AddMissingEvaluationTopicDTO,
  ClearLessonHistoryResultDTO,

  LessonAnswerAttemptsDTO,
  LessonAnswerVerificationDTO,
  LessonChatHistoryDTO,
  LessonCodeExecutionDTO,
  LessonCodeHintDTO,
  LessonCodeSubmissionDTO,
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
import type { LessonMutationResult } from '../domain/repositories/tracker-lesson.repository.interface'

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
  toLessonChatHistoryDto(history: LessonChatHistoryDTO): LessonChatHistoryDTO
  toLessonTutorChatResponseDto(response: { answer: string }): LessonTutorChatResponseDTO
  toLessonGeneratedQuestionsDto(result: LessonGeneratedQuestionsDTO): LessonGeneratedQuestionsDTO
  toLessonQuestionSolutionDto(result: LessonQuestionSolutionDTO): LessonQuestionSolutionDTO
  toLessonQuestionSolutionDoubtsDto(result: LessonQuestionSolutionDoubtsDTO): LessonQuestionSolutionDoubtsDTO
  toLessonQuestionSolutionDoubtAnswerDto(result: LessonQuestionSolutionDoubtAnswerDTO): LessonQuestionSolutionDoubtAnswerDTO
  toLessonAnswerAttemptsDto(result: LessonAnswerAttemptsDTO): LessonAnswerAttemptsDTO
  toLessonAnswerVerificationDto(result: LessonAnswerVerificationDTO): LessonAnswerVerificationDTO
  toLessonCodeSubmissionsDto(result: LessonCodeSubmissionsDTO): LessonCodeSubmissionsDTO
  toLessonCodeExecutionDto(result: LessonCodeExecutionDTO): LessonCodeExecutionDTO
  toLessonCodeSubmissionDto(result: LessonCodeSubmissionDTO): LessonCodeSubmissionDTO
  toLessonCodeHintDto(result: LessonCodeHintDTO): LessonCodeHintDTO
  toLessonOptimizedSolutionDto(result: LessonOptimizedSolutionDTO): LessonOptimizedSolutionDTO
  toLessonVisualizationDto(result: LessonVisualizationDTO): LessonVisualizationDTO
  toTrackerAIValidationDto(result: TrackerAIValidationDTO): TrackerAIValidationDTO
  toAddMissingEvaluationTopicDto(result: AddMissingEvaluationTopicResult): AddMissingEvaluationTopicDTO
  toClearLessonHistoryResultDto(result: LessonMutationResult): ClearLessonHistoryResultDTO
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

  toLessonChatHistoryDto(history: LessonChatHistoryDTO): LessonChatHistoryDTO {
    return history
  }

  toLessonTutorChatResponseDto(response: { answer: string }): LessonTutorChatResponseDTO {
    return response
  }

  toLessonGeneratedQuestionsDto(result: LessonGeneratedQuestionsDTO): LessonGeneratedQuestionsDTO {
    return result
  }

  toLessonQuestionSolutionDto(result: LessonQuestionSolutionDTO): LessonQuestionSolutionDTO {
    return result
  }

  toLessonQuestionSolutionDoubtsDto(result: LessonQuestionSolutionDoubtsDTO): LessonQuestionSolutionDoubtsDTO {
    return result
  }

  toLessonQuestionSolutionDoubtAnswerDto(
    result: LessonQuestionSolutionDoubtAnswerDTO
  ): LessonQuestionSolutionDoubtAnswerDTO {
    return result
  }

  toLessonAnswerAttemptsDto(result: LessonAnswerAttemptsDTO): LessonAnswerAttemptsDTO {
    return result
  }

  toLessonAnswerVerificationDto(result: LessonAnswerVerificationDTO): LessonAnswerVerificationDTO {
    return result
  }

  toLessonCodeSubmissionsDto(result: LessonCodeSubmissionsDTO): LessonCodeSubmissionsDTO {
    return result
  }

  toLessonCodeExecutionDto(result: LessonCodeExecutionDTO): LessonCodeExecutionDTO {
    return result
  }

  toLessonCodeSubmissionDto(result: LessonCodeSubmissionDTO): LessonCodeSubmissionDTO {
    return result
  }

  toLessonCodeHintDto(result: LessonCodeHintDTO): LessonCodeHintDTO {
    return result
  }

  toLessonOptimizedSolutionDto(result: LessonOptimizedSolutionDTO): LessonOptimizedSolutionDTO {
    return result
  }

  toLessonVisualizationDto(result: LessonVisualizationDTO): LessonVisualizationDTO {
    return result
  }

  toTrackerAIValidationDto(result: TrackerAIValidationDTO): TrackerAIValidationDTO {
    return result
  }

  toAddMissingEvaluationTopicDto(
    result: AddMissingEvaluationTopicResult
  ): AddMissingEvaluationTopicDTO {
    return result
  }

  toClearLessonHistoryResultDto(
    result: LessonMutationResult,
  ): ClearLessonHistoryResultDTO {
    const deletedCount = result.modifiedCount ?? 0

    return {
      success: result.acknowledged ?? true,
      cleared: deletedCount > 0,
      deletedCount,
    }
  }
}
