import type {
  AddMissingEvaluationTopicDto,
  ClearLessonHistoryResultDto,

  LessonAnswerAttemptsDto,
  LessonAnswerVerificationDto,
  LessonChatHistoryDto,
  LessonCodeExecutionDto,
  LessonCodeHintDto,
  LessonCodeSubmissionsDto,
  LessonGeneratedQuestionsDto,
  LessonOptimizedSolutionDto,
  LessonQuestionSolutionDoubtAnswerDto,
  LessonQuestionSolutionDoubtsDto,
  LessonQuestionSolutionDto,
  LessonTutorChatResponseDto,
  LessonVisualizationDto,
  TrackerAIValidationDto,
  TrackerDetailsDto,
  TrackerDto,
  TrackerListDto,
  TrackerSubtopicDto,
  TrackerSummaryDto,
  TrackerTopicDto,
  UpdateSubtopicProgressResultDto,
} from '../dtos/tracker.dto'
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
} from '../../domain/types/trackers.types'


export interface TrackerMapperContract {
  toTrackerDto(tracker: TrackerRecord): TrackerDto
  toTrackerDetailsDto(tracker: TrackerRecord): TrackerDetailsDto
  toTrackerSummaryDto(summary: TrackerSummaryRecord | TrackerSummaryResult): TrackerSummaryDto
  toTrackerListDto(result: TrackerListResult): TrackerListDto
  toTrackerRoadmapDto<T>(roadmap: T): T
  toTrackerTopicDto(topic: CreatedTrackerTopicRecord): TrackerTopicDto
  toTrackerSubtopicDto(subtopic: CreatedTrackerSubtopicRecord): TrackerSubtopicDto
  toSubtopicProgressResultDto(result: {
    subtopic: SubtopicWithProgressRecord
    progress: TrackerProgressRecord | null
  }): UpdateSubtopicProgressResultDto
  toGeneratedLessonDto<T>(lesson: T): T
  toLessonChatHistoryDto(history: unknown[]): LessonChatHistoryDto
  toLessonTutorChatResponseDto(response: { answer: string }): LessonTutorChatResponseDto
  toLessonGeneratedQuestionsDto(result: unknown): LessonGeneratedQuestionsDto
  toLessonQuestionSolutionDto(result: unknown): LessonQuestionSolutionDto
  toLessonQuestionSolutionDoubtsDto(result: unknown[]): LessonQuestionSolutionDoubtsDto
  toLessonQuestionSolutionDoubtAnswerDto(result: unknown): LessonQuestionSolutionDoubtAnswerDto
  toLessonAnswerAttemptsDto(result: unknown[]): LessonAnswerAttemptsDto
  toLessonAnswerVerificationDto(result: unknown): LessonAnswerVerificationDto
  toLessonCodeSubmissionsDto(result: unknown[]): LessonCodeSubmissionsDto
  toLessonCodeExecutionDto(result: unknown): LessonCodeExecutionDto
  toLessonCodeHintDto(result: unknown): LessonCodeHintDto
  toLessonOptimizedSolutionDto(result: unknown): LessonOptimizedSolutionDto
  toLessonVisualizationDto(result: unknown): LessonVisualizationDto
  toTrackerAIValidationDto(result: unknown): TrackerAIValidationDto
  toAddMissingEvaluationTopicDto(result: AddMissingEvaluationTopicResult): AddMissingEvaluationTopicDto
  toClearLessonHistoryResultDto(result: unknown): ClearLessonHistoryResultDto
}

export class TrackerMapper implements TrackerMapperContract {
  toTrackerDto(tracker: TrackerRecord): TrackerDto {
    return tracker
  }

  toTrackerDetailsDto(tracker: TrackerRecord): TrackerDetailsDto {
    return tracker
  }

  toTrackerSummaryDto(
    summary: TrackerSummaryRecord | TrackerSummaryResult
  ): TrackerSummaryDto {
    return summary
  }

  toTrackerListDto(result: TrackerListResult): TrackerListDto {
    return result
  }

  toTrackerRoadmapDto<T>(roadmap: T): T {
    return roadmap
  }

  toTrackerTopicDto(topic: CreatedTrackerTopicRecord): TrackerTopicDto {
    return topic
  }

  toTrackerSubtopicDto(subtopic: CreatedTrackerSubtopicRecord): TrackerSubtopicDto {
    return subtopic
  }

  toSubtopicProgressResultDto(result: {
    subtopic: SubtopicWithProgressRecord
    progress: TrackerProgressRecord | null
  }): UpdateSubtopicProgressResultDto {
    return result
  }

  toGeneratedLessonDto<T>(lesson: T): T {
    return lesson
  }

  toLessonChatHistoryDto(history: unknown[]): LessonChatHistoryDto {
    return history
  }

  toLessonTutorChatResponseDto(response: { answer: string }): LessonTutorChatResponseDto {
    return response
  }

  toLessonGeneratedQuestionsDto(result: unknown): LessonGeneratedQuestionsDto {
    return result
  }

  toLessonQuestionSolutionDto(result: unknown): LessonQuestionSolutionDto {
    return result
  }

  toLessonQuestionSolutionDoubtsDto(result: unknown[]): LessonQuestionSolutionDoubtsDto {
    return result
  }

  toLessonQuestionSolutionDoubtAnswerDto(
    result: unknown
  ): LessonQuestionSolutionDoubtAnswerDto {
    return result
  }

  toLessonAnswerAttemptsDto(result: unknown[]): LessonAnswerAttemptsDto {
    return result
  }

  toLessonAnswerVerificationDto(result: unknown): LessonAnswerVerificationDto {
    return result
  }

  toLessonCodeSubmissionsDto(result: unknown[]): LessonCodeSubmissionsDto {
    return result
  }

  toLessonCodeExecutionDto(result: unknown): LessonCodeExecutionDto {
    return result
  }

  toLessonCodeHintDto(result: unknown): LessonCodeHintDto {
    return result
  }

  toLessonOptimizedSolutionDto(result: unknown): LessonOptimizedSolutionDto {
    return result
  }

  toLessonVisualizationDto(result: unknown): LessonVisualizationDto {
    return result
  }

  toTrackerAIValidationDto(result: unknown): TrackerAIValidationDto {
    return result
  }

  toAddMissingEvaluationTopicDto(
    result: AddMissingEvaluationTopicResult
  ): AddMissingEvaluationTopicDto {
    return result
  }

  toClearLessonHistoryResultDto(result: unknown): ClearLessonHistoryResultDto {
    return result as ClearLessonHistoryResultDto
  }
}
