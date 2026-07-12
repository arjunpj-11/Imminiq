import { TrackerApplicationError } from '../tracker-application.error'
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface'
import { ITrackerMapper } from '..';

export interface IUnpublishTrackerUseCase {
  execute(input: { trackerId: string; userId: string }): Promise<import("../../domain").TrackerRecord>
}

export class UnpublishTrackerUseCase implements IUnpublishTrackerUseCase {
  constructor(private readonly _trackerRepository: ITrackerRepository,private readonly _trackerMapper: ITrackerMapper) {}

  async execute(input: { trackerId: string; userId: string }) {
    const tracker = await this._trackerRepository.unpublishOwnedTracker(input)

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    return this._trackerMapper.toTrackerDto(tracker)
  }
}
