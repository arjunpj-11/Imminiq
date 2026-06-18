import type { TrackerRepositoryContract } from './tracker.repository.interface'

export type TrackerProgressRepositoryContract = Pick<
  TrackerRepositoryContract,
  | 'ensureUserProgressInitialized'
  | 'getUserSubtopicsProgress'
  | 'getUserTopicsProgress'
  | 'updateSubtopicProgress'
  | 'unlockNextSubtopic'
  | 'checkAndCompleteParentSubtopic'
  | 'checkAndCompleteTopicAndUnlockNext'
  | 'recomputeTrackerProgress'
>