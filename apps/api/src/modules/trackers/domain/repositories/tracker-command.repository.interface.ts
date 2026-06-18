import type { TrackerRepositoryContract } from './tracker.repository.interface'

export type TrackerCommandRepositoryContract = Pick<
  TrackerRepositoryContract,
  | 'createTracker'
  | 'updateOwnedTracker'
  | 'softDeleteOwnedTracker'
  | 'archiveOwnedTracker'
  | 'restoreOwnedTracker'
  | 'publishOwnedTracker'
  | 'unpublishOwnedTracker'
>