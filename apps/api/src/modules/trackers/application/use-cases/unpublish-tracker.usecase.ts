import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'

export class UnpublishTrackerUseCase {
  constructor(private readonly trackerRepository: TrackerRepositoryContract) {}

  async execute(input: { trackerId: string; userId: string }) {
    const tracker = await this.trackerRepository.unpublishOwnedTracker(input)

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    return tracker
  }
}
