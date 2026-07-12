import type {
  CreateTrackerInput,
  PublishTrackerInput,
  TrackerRecord,
  UpdateTrackerInput,
} from '../trackers.types'

export type TrackerOwnerInput = {
  trackerId: string
  userId: string
}

export type SoftDeleteOwnedTrackerInput = TrackerOwnerInput

export type ArchiveOwnedTrackerInput = TrackerOwnerInput

export type RestoreOwnedTrackerInput = TrackerOwnerInput

export type UnpublishOwnedTrackerInput = TrackerOwnerInput

export interface ITrackerCommandRepository {
  createTracker(data: CreateTrackerInput): Promise<TrackerRecord>

  updateOwnedTracker(data: UpdateTrackerInput): Promise<TrackerRecord | null>

  softDeleteOwnedTracker(
    data: SoftDeleteOwnedTrackerInput
  ): Promise<TrackerRecord | null>

  archiveOwnedTracker(
    data: ArchiveOwnedTrackerInput
  ): Promise<TrackerRecord | null>

  restoreOwnedTracker(
    data: RestoreOwnedTrackerInput
  ): Promise<TrackerRecord | null>

  publishOwnedTracker(data: PublishTrackerInput): Promise<TrackerRecord | null>

  unpublishOwnedTracker(
    data: UnpublishOwnedTrackerInput
  ): Promise<TrackerRecord | null>
}