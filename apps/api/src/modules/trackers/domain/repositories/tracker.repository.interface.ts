import type {
  CreateTrackerTopicInput,
  CreateTrackerSubtopicInput,
  CreatedTrackerTopicRecord,
  CreatedTrackerSubtopicRecord,
  EvaluationJobRecord,
  LastSiblingSubtopicRecord,
  LastTopicRecord,
  TrackerRecord,
  TrackerSubtopicRecord,
  TrackerTopicRecord,
} from '../types/trackers.types'

export interface TrackerRepository {
  hasAnyTrackerForUser(userId: string): Promise<boolean>

  findOwnedTrackerById(
    trackerId: string,
    userId: string
  ): Promise<TrackerRecord | null>

  findEvaluationJobById(
    evaluationJobId: string,
    userId: string
  ): Promise<EvaluationJobRecord | null>

  getTopicsForTracker(
    trackerId: string
  ): Promise<TrackerTopicRecord[]>

  getSubtopicsForTracker(
    trackerId: string
  ): Promise<TrackerSubtopicRecord[]>

  findLastTopicForTracker(
    trackerId: string
  ): Promise<LastTopicRecord | null>

  shiftTopicOrdersFrom(data: {
    trackerId: string
    fromOrder: number
  }): Promise<unknown>

  createTrackerTopic(
    data: CreateTrackerTopicInput
  ): Promise<CreatedTrackerTopicRecord>

  findLastSiblingSubtopic(data: {
    topicId: string
    parentSubtopicId: string | null
  }): Promise<LastSiblingSubtopicRecord | null>

  createTrackerSubtopic(
    data: CreateTrackerSubtopicInput
  ): Promise<CreatedTrackerSubtopicRecord>

  incrementTrackerTopicsCount(
    trackerId: string
  ): Promise<unknown>

  incrementTrackerSubtopicsCount(
    trackerId: string
  ): Promise<unknown>

  markMissingEvaluationTopicAsAdded(data: {
    evaluationJobId: string
    topicIndex: number
    addedSubtopicId?: string
    addedTopicId?: string
  }): Promise<unknown>
}
