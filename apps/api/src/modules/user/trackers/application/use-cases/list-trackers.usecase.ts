import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface'
import type { TrackerListFilter } from '../../domain/trackers.types'
import { ITrackerMapper } from '..'

export interface IListTrackersUseCase {
  execute(filter: TrackerListFilter): Promise<import("../../domain/value-objects/tracker-record.vo").TrackerListResult>
}

export class ListTrackersUseCase implements IListTrackersUseCase {
  constructor(private readonly _trackerRepository: Pick<ITrackerRepository, 'listOwnedTrackers'>,private readonly _trackerMapper: ITrackerMapper) {}

  async execute(filter: TrackerListFilter) {
    return this._trackerMapper.toTrackerListDto(await this._trackerRepository.listOwnedTrackers(filter))
  }
}
