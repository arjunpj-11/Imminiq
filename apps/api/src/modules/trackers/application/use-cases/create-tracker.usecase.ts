import type { TrackerRepository } from '../../domain/repositories/tracker.repository.interface'
import type { CreateTrackerInput } from '../../domain/types/trackers.types'

export class CreateTrackerUseCase {
  constructor(private readonly trackerRepository: TrackerRepository) {}

  async execute(input: CreateTrackerInput) {
    return this.trackerRepository.createTracker(input)
  }
}
