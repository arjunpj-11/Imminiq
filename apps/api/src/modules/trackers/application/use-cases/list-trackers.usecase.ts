import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'
import type { TrackerListFilter } from '../../domain/types/trackers.types'

export class ListTrackersUseCase {
  constructor(private readonly trackerRepository: TrackerRepositoryContract) {}

  async execute(filter: TrackerListFilter) {
    return this.trackerRepository.listOwnedTrackers(filter)
  }
}
