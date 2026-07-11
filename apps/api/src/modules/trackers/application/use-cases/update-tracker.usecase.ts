import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface'
import type { UpdateTrackerInput } from '../../domain/types/trackers.types'
import { ITrackerMapper } from '../mappers'

export class UpdateTrackerUseCase {
  constructor(private readonly _trackerRepository: ITrackerRepository,private readonly _trackerMapper: ITrackerMapper) {}

  async execute(input: UpdateTrackerInput) {
    const tracker = await this._trackerRepository.updateOwnedTracker(input)

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    return this._trackerMapper.toTrackerDto(tracker)
  }
}
