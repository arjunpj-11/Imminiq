import { ApiError } from '../../../../shared/utils/ApiError'
import type { TrackerRepository } from '../../domain/repositories/tracker.repository.interface'
import type { UpdateTrackerInput } from '../../domain/types/trackers.types'

export class UpdateTrackerUseCase {
  constructor(private readonly trackerRepository: TrackerRepository) {}

  async execute(input: UpdateTrackerInput) {
    const tracker = await this.trackerRepository.updateOwnedTracker(input)

    if (!tracker) {
      throw new ApiError(404, 'Tracker not found', 'TRACKER_NOT_FOUND')
    }

    return tracker
  }
}
