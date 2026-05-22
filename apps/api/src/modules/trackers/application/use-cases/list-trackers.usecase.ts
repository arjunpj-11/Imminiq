import type { TrackerRepository } from '../../domain/repositories/tracker.repository.interface'
import type { TrackerListFilter } from '../../domain/types/trackers.types'

export class ListTrackersUseCase {
  constructor(private readonly trackerRepository: TrackerRepository) {}

  async execute(filter: TrackerListFilter) {
    return this.trackerRepository.listOwnedTrackers(filter)
  }
}
