import type {
  CreateTrackerSubtopicInput,
  CreateTrackerTopicInput,
  CreatedTrackerSubtopicRecord,
  CreatedTrackerTopicRecord,
  EvaluationJobRecord,
  LastSiblingSubtopicRecord,
  LastTopicRecord,
} from '../types/trackers.types'

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

export interface TrackerContentRepositoryContract {
  findEvaluationJobById(
    data: FindEvaluationJobByIdInput
  ): Promise<EvaluationJobRecord | null>

  findLastTopicForTracker(trackerId: string): Promise<LastTopicRecord | null>

  shiftTopicOrdersFrom(data: ShiftTopicOrdersFromInput): Promise<unknown>

  createTrackerTopic(
    data: CreateTrackerTopicInput
  ): Promise<CreatedTrackerTopicRecord>

  findLastSiblingSubtopic(
    data: FindLastSiblingSubtopicInput
  ): Promise<LastSiblingSubtopicRecord | null>

  createTrackerSubtopic(
    data: CreateTrackerSubtopicInput
  ): Promise<CreatedTrackerSubtopicRecord>

  incrementTrackerTopicsCount(trackerId: string): Promise<unknown>

  incrementTrackerSubtopicsCount(trackerId: string): Promise<unknown>

  markMissingEvaluationTopicAsAdded(
    data: MarkMissingEvaluationTopicAsAddedInput
  ): Promise<unknown>
}