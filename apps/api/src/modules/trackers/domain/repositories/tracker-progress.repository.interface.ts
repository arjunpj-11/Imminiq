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

export type UpdateSubtopicProgressResult = {
  subtopic: SubtopicWithProgressRecord
  isCompleted: boolean
  wasNewlyCompleted: boolean
}

export type UnlockNextSubtopicResult = {
  unlocked: boolean
  subtopicId: string | null
}

export type ParentSubtopicCompletionResult = {
  subtopicId: string
  isCompleted: boolean
  wasNewlyCompleted: boolean
}

export type TopicCompletionResult = {
  topicId: string
  topicTitle: string | null

  isCompleted: boolean
  wasNewlyCompleted: boolean

  nextTopicUnlocked: boolean
  nextTopicId: string | null
}

export type TrackerProgressUpdateResult = {
  progress: TrackerProgressRecord | null
  isCompleted: boolean
  wasNewlyCompleted: boolean
}

export interface TrackerProgressRepositoryContract {
  ensureUserProgressInitialized(
    data: EnsureUserProgressInitializedInput,
  ): Promise<void>

  getUserSubtopicsProgress(
    data: GetUserSubtopicsProgressInput,
  ): Promise<UserSubtopicProgressRecord[]>

  getUserTopicsProgress(
    data: GetUserTopicsProgressInput,
  ): Promise<UserTopicProgressRecord[]>

  updateSubtopicProgress(
    data: UpdateSubtopicProgressInput,
  ): Promise<UpdateSubtopicProgressResult | null>

  unlockNextSubtopic(
    data: UnlockNextSubtopicInput,
  ): Promise<UnlockNextSubtopicResult>

  checkAndCompleteParentSubtopic(
    data: CheckAndCompleteParentSubtopicInput,
  ): Promise<ParentSubtopicCompletionResult>

  checkAndCompleteTopicAndUnlockNext(
    data: CheckAndCompleteTopicAndUnlockNextInput,
  ): Promise<TopicCompletionResult>

  recomputeTrackerProgress(
    data: RecomputeTrackerProgressInput,
  ): Promise<TrackerProgressUpdateResult>
}