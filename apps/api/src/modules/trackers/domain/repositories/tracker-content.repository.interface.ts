import type { TrackerRepositoryContract } from './tracker.repository.interface'

export type TrackerContentRepositoryContract = Pick<
  TrackerRepositoryContract,
  | 'findEvaluationJobById'
  | 'findLastTopicForTracker'
  | 'shiftTopicOrdersFrom'
  | 'createTrackerTopic'
  | 'findLastSiblingSubtopic'
  | 'createTrackerSubtopic'
  | 'incrementTrackerTopicsCount'
  | 'incrementTrackerSubtopicsCount'
  | 'markMissingEvaluationTopicAsAdded'
>