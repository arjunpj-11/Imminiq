import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'

export class DeleteTrackerUseCase {
  constructor(private readonly trackerRepository: TrackerRepositoryContract) {}

  async execute(input: { trackerId: string; userId: string }) {
    const tracker = await this.trackerRepository.softDeleteOwnedTracker(input)

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    return tracker
  }
}
