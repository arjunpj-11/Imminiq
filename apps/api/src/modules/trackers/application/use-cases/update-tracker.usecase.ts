import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'
import type { UpdateTrackerInput } from '../../domain/types/trackers.types'
import { TrackerMapperContract } from '../mappers'

export class UpdateTrackerUseCase {
  constructor(private readonly _trackerRepository: TrackerRepositoryContract,private readonly trackerMapper: TrackerMapperContract) {}

  async execute(input: UpdateTrackerInput) {
    const tracker = await this._trackerRepository.updateOwnedTracker(input)

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    return this.trackerMapper.toTrackerDto(tracker)
  }
}
