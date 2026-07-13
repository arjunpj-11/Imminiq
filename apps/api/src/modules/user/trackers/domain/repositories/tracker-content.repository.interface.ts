import type {
  CreateTrackerSubtopicInput,
  CreateTrackerTopicInput,
  CreatedTrackerSubtopicRecord,
  CreatedTrackerTopicRecord,
  EvaluationJobRecord,
  LastSiblingSubtopicRecord,
  LastTopicRecord,
} from '../trackers.types'

export type FindEvaluationJobByIdInput = {
  evaluationJobId: string
  userId: string
}

export type ShiftTopicOrdersFromInput = {
  trackerId: string
  fromOrder: number
}

export type FindLastSiblingSubtopicInput = {
  topicId: string
  parentSubtopicId: string | null
}

export type MarkMissingEvaluationTopicAsAddedInput = {
  evaluationJobId: string
  topicIndex: number
  addedSubtopicId?: string
  addedTopicId?: string
}

export interface ITrackerContentRepository {
  findEvaluationJobById(
    data: FindEvaluationJobByIdInput
  ): Promise<EvaluationJobRecord | null>

  findLastTopicForTracker(trackerId: string): Promise<LastTopicRecord | null>

  shiftTopicOrdersFrom(
    data: ShiftTopicOrdersFromInput
  ): Promise<void>

  createTrackerTopic(
    data: CreateTrackerTopicInput
  ): Promise<CreatedTrackerTopicRecord>

  findLastSiblingSubtopic(
    data: FindLastSiblingSubtopicInput
  ): Promise<LastSiblingSubtopicRecord | null>

  createTrackerSubtopic(
    data: CreateTrackerSubtopicInput
  ): Promise<CreatedTrackerSubtopicRecord>

  incrementTrackerTopicsCount(
    trackerId: string
  ): Promise<void>

  incrementTrackerSubtopicsCount(
    trackerId: string
  ): Promise<void>

  markMissingEvaluationTopicAsAdded(
    data: MarkMissingEvaluationTopicAsAddedInput
  ): Promise<void>
}
