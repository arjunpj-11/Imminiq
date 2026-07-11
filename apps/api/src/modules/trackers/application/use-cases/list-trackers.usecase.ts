import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'
import type { TrackerListFilter } from '../../domain/types/trackers.types'
import { TrackerMapperContract } from '../mappers'

export class ListTrackersUseCase {
  constructor(private readonly _trackerRepository: TrackerRepositoryContract,private readonly _trackerMapper: TrackerMapperContract) {}

  async execute(filter: TrackerListFilter) {
    return this._trackerMapper.toTrackerListDto(await this._trackerRepository.listOwnedTrackers(filter))
  }
}
