import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'
import type { CreateTrackerInput } from '../../domain/types/trackers.types'

export class CreateTrackerUseCase {
  constructor(private readonly trackerRepository: TrackerRepositoryContract) {}

  async execute(input: CreateTrackerInput) {
    return this.trackerRepository.createTracker(input)
  }
}
