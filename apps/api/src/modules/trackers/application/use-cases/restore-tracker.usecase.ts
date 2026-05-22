import { ApiError } from '../../../../shared/utils/ApiError'
import type { TrackerRepository } from '../../domain/repositories/tracker.repository.interface'

export class RestoreTrackerUseCase {
  constructor(private readonly trackerRepository: TrackerRepository) {}

  async execute(input: { trackerId: string; userId: string }) {
    const tracker = await this.trackerRepository.restoreOwnedTracker(input)

    if (!tracker) {
      throw new ApiError(404, 'Tracker not found', 'TRACKER_NOT_FOUND')
    }

    return tracker
  }
}
