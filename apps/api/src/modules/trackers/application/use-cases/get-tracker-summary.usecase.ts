import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'

export class GetTrackerSummaryUseCase {
  constructor(private readonly trackerRepository: TrackerRepositoryContract) {}

  async execute(userId: string) {
    return this.trackerRepository.getTrackerSummary(userId)
  }
}
