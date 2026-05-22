import { ApiError } from '../../../../shared/utils/ApiError'
import type { TrackerRepository } from '../../domain/repositories/tracker.repository.interface'

export class UnpublishTrackerUseCase {
  constructor(private readonly trackerRepository: TrackerRepository) {}

  async execute(input: { trackerId: string; userId: string }) {
    const tracker = await this.trackerRepository.unpublishOwnedTracker(input)

    if (!tracker) {
      throw new ApiError(404, 'Tracker not found', 'TRACKER_NOT_FOUND')
    }

    return tracker
  }
}
