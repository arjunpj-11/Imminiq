import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface'
import { ITrackerMapper } from '../mappers';

export interface IRestoreTrackerUseCase {
  execute(input: { trackerId: string; userId: string }): Promise<import("../../domain").TrackerRecord>
}

export class RestoreTrackerUseCase implements IRestoreTrackerUseCase {
  constructor(private readonly _trackerRepository: ITrackerRepository,private readonly _trackerMapper: ITrackerMapper) {}

  async execute(input: { trackerId: string; userId: string }) {
    const tracker = await this._trackerRepository.restoreOwnedTracker(input)

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    return this._trackerMapper.toTrackerDto(tracker)
  }
}
