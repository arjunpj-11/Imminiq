import type { TrackerRepositoryContract } from './tracker.repository.interface'

export type TrackerQueryRepositoryContract = Pick<
  TrackerRepositoryContract,
  | 'hasAnyTrackerForUser'
  | 'getTrackerSummary'
  | 'listOwnedTrackers'
  | 'findOwnedTrackerById'
  | 'getTopicsForTracker'
  | 'getTopicsWithUserProgress'
  | 'getSubtopicsForTracker'
  | 'getSubtopicsWithUserProgress'
  | 'getSubtopicById'
  | 'findLessonBySubtopicId'
  | 'findGeneratedLessonBySubtopic'
>