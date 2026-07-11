import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'
import { TrackerMapperContract } from '../mappers';

export class RestoreTrackerUseCase {
  constructor(private readonly _trackerRepository: TrackerRepositoryContract,private readonly _trackerMapper: TrackerMapperContract) {}

  async execute(input: { trackerId: string; userId: string }) {
    const tracker = await this._trackerRepository.restoreOwnedTracker(input)

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    return this._trackerMapper.toTrackerDto(tracker)
  }
}
