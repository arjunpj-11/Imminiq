import { TrackerApplicationError } from '../tracker-application.error'
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface'
import type { UpdateTrackerInput } from '../../domain/trackers.types'
import { ITrackerMapper } from '..'

export interface IUpdateTrackerUseCase {
  execute(input: UpdateTrackerInput): Promise<import("../../domain/value-objects/tracker-record.vo").TrackerRecord>
}

export class UpdateTrackerUseCase implements IUpdateTrackerUseCase {
  constructor(private readonly _trackerRepository: ITrackerRepository,private readonly _trackerMapper: ITrackerMapper) {}

  async execute(input: UpdateTrackerInput) {
    const tracker = await this._trackerRepository.updateOwnedTracker(input)

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    return this._trackerMapper.toTrackerDto(tracker)
  }
}
