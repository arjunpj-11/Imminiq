import { ApiError } from '../../../../shared/utils/ApiError'
import type { TrackerRepository } from '../../domain/repositories/tracker.repository.interface'
import { buildRoadmapTree } from '../utils/tracker-roadmap-tree.util'

export class GetTrackerRoadmapUseCase {
  constructor(private readonly trackerRepository: TrackerRepository) {}

  async execute(input: { trackerId: string; userId: string }) {
    const tracker = await this.trackerRepository.findOwnedTrackerById(
      input.trackerId,
      input.userId
    )

    if (!tracker) {
      throw new ApiError(404, 'Tracker not found', 'TRACKER_NOT_FOUND')
    }

    const [topics, subtopics] = await Promise.all([
      this.trackerRepository.getTopicsForTracker(input.trackerId),
      this.trackerRepository.getSubtopicsForTracker(input.trackerId),
    ])

    return {
      tracker,
      roadmap: buildRoadmapTree({ topics, subtopics }),
    }
  }
}
