import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'
import type { TrackerListFilter } from '../../domain/types/trackers.types'
import { TrackerMapperContract } from '../mappers'

export class ListTrackersUseCase {
  constructor(private readonly _trackerRepository: TrackerRepositoryContract,private readonly trackerMapper: TrackerMapperContract) {}

  async execute(filter: TrackerListFilter) {
    return this.trackerMapper.toTrackerListDto(await this._trackerRepository.listOwnedTrackers(filter))
  }
}
