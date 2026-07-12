import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface'
import type { TrackerListFilter } from '../../domain/types/trackers.types'
import { ITrackerMapper } from '../mappers'

export class ListTrackersUseCase {
  constructor(private readonly _trackerRepository: ITrackerRepository,private readonly _trackerMapper: ITrackerMapper) {}

  async execute(filter: TrackerListFilter) {
    return this._trackerMapper.toTrackerListDto(await this._trackerRepository.listOwnedTrackers(filter))
  }
}
