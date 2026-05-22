import { ApiError } from '../../../../shared/utils/ApiError'
import type { TrackerRepository } from '../../domain/repositories/tracker.repository.interface'

export class GetTrackerDetailsUseCase {
  constructor(private readonly trackerRepository: TrackerRepository) {}

  async execute(input: { trackerId: string; userId: string }) {
    const tracker = await this.trackerRepository.findOwnedTrackerById(
      input.trackerId,
      input.userId
    )

    if (!tracker) {
      throw new ApiError(404, 'Tracker not found', 'TRACKER_NOT_FOUND')
    }

    return tracker
  }
}
