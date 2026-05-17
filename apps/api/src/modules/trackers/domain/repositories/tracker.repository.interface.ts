import type {
  CreateTrackerSubtopicInput,
  CreatedTrackerSubtopicRecord,
  EvaluationJobRecord,
  LastSiblingSubtopicRecord,
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

  findLastSiblingSubtopic(data: {
    topicId: string
    parentSubtopicId: string | null
  }): Promise<LastSiblingSubtopicRecord | null>

  createTrackerSubtopic(
    data: CreateTrackerSubtopicInput
  ): Promise<CreatedTrackerSubtopicRecord>

  incrementTrackerSubtopicsCount(
    trackerId: string
  ): Promise<unknown>

  markMissingEvaluationTopicAsAdded(data: {
    evaluationJobId: string
    topicIndex: number
    addedSubtopicId: string
  }): Promise<unknown>
}
