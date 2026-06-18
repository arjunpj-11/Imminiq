import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'
import type { UpdateTrackerInput } from '../../domain/types/trackers.types'

export class UpdateTrackerUseCase {
  constructor(private readonly trackerRepository: TrackerRepositoryContract) {}

  async execute(input: UpdateTrackerInput) {
    const tracker = await this.trackerRepository.updateOwnedTracker(input)

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    return tracker
  }
}
