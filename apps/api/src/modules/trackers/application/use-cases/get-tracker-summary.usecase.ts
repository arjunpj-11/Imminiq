import type { TrackerRepository } from '../../domain/repositories/tracker.repository.interface'

export class GetTrackerSummaryUseCase {
  constructor(private readonly trackerRepository: TrackerRepository) {}

  async execute(userId: string) {
    return this.trackerRepository.getTrackerSummary(userId)
  }
}
