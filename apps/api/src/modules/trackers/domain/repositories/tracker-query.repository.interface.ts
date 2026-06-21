import type { GeneratedLessonData } from '../types/lesson-practice.types'
import type {
  GeneratedTrackerLessonRecord,
  SubtopicWithProgressRecord,
  TopicWithProgressRecord,
  TrackerListFilter,
  TrackerListResult,
  TrackerRecord,
  TrackerSubtopicRecord,
  TrackerSummaryRecord,
  TrackerTopicRecord,
} from '../types/trackers.types'

export type FindOwnedTrackerByIdInput = {
  trackerId: string
  userId: string
}

export type GetTopicsWithUserProgressInput = {
  trackerId: string
  userId: string
}

export type GetSubtopicsWithUserProgressInput = {
  trackerId: string
  userId: string
}

export type GetSubtopicByIdInput = {
  trackerId: string
  subtopicId: string
}

export type FindLessonBySubtopicIdInput = {
  trackerId: string
  subtopicId: string
  userId: string
}

export type FindGeneratedLessonBySubtopicInput = {
  trackerId: string
  subtopicId: string
  userId: string
}

export interface TrackerQueryRepositoryContract {
  hasAnyTrackerForUser(userId: string): Promise<boolean>

  getTrackerSummary(userId: string): Promise<TrackerSummaryRecord>

  listOwnedTrackers(filter: TrackerListFilter): Promise<TrackerListResult>

  findOwnedTrackerById(
    data: FindOwnedTrackerByIdInput
  ): Promise<TrackerRecord | null>

  getTopicsForTracker(trackerId: string): Promise<TrackerTopicRecord[]>

  getTopicsWithUserProgress(
    data: GetTopicsWithUserProgressInput
  ): Promise<TopicWithProgressRecord[]>

  getSubtopicsForTracker(trackerId: string): Promise<TrackerSubtopicRecord[]>

  getSubtopicsWithUserProgress(
    data: GetSubtopicsWithUserProgressInput
  ): Promise<SubtopicWithProgressRecord[]>

  getSubtopicById(
    data: GetSubtopicByIdInput
  ): Promise<TrackerSubtopicRecord | null>

  findLessonBySubtopicId(
    data: FindLessonBySubtopicIdInput
  ): Promise<GeneratedTrackerLessonRecord | null>

  findGeneratedLessonBySubtopic(
    data: FindGeneratedLessonBySubtopicInput
  ): Promise<GeneratedLessonData | null>
}