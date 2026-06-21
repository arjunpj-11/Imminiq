import type {
  SubtopicWithProgressRecord,
  TrackerProgressRecord,
  UpdateSubtopicProgressInput,
  UserSubtopicProgressRecord,
  UserTopicProgressRecord,
} from '../types/trackers.types'

export type EnsureUserProgressInitializedInput = {
  userId: string
  trackerId: string
}

export type GetUserSubtopicsProgressInput = {
  userId: string
  trackerId: string
}

export type GetUserTopicsProgressInput = {
  userId: string
  trackerId: string
}

export type UnlockNextSubtopicInput = {
  trackerId: string
  topicId: string
  completedSubtopicOrder: number
  parentSubtopicId: string | null
  userId: string
}

export type CheckAndCompleteParentSubtopicInput = {
  trackerId: string
  topicId: string
  parentSubtopicId: string
  userId: string
}

export type CheckAndCompleteTopicAndUnlockNextInput = {
  trackerId: string
  topicId: string
  userId: string
}

export type RecomputeTrackerProgressInput = {
  trackerId: string
  userId: string
}

export interface TrackerProgressRepositoryContract {
  ensureUserProgressInitialized(
    data: EnsureUserProgressInitializedInput
  ): Promise<void>

  getUserSubtopicsProgress(
    data: GetUserSubtopicsProgressInput
  ): Promise<UserSubtopicProgressRecord[]>

  getUserTopicsProgress(
    data: GetUserTopicsProgressInput
  ): Promise<UserTopicProgressRecord[]>

  updateSubtopicProgress(
    data: UpdateSubtopicProgressInput
  ): Promise<SubtopicWithProgressRecord | null>

  unlockNextSubtopic(data: UnlockNextSubtopicInput): Promise<unknown>

  checkAndCompleteParentSubtopic(
    data: CheckAndCompleteParentSubtopicInput
  ): Promise<unknown>

  checkAndCompleteTopicAndUnlockNext(
    data: CheckAndCompleteTopicAndUnlockNextInput
  ): Promise<unknown>

  recomputeTrackerProgress(
    data: RecomputeTrackerProgressInput
  ): Promise<TrackerProgressRecord | null>
}