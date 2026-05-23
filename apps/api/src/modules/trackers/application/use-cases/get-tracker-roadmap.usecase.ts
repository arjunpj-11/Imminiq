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

    // Make sure progress rows exist before reading them
    await this.trackerRepository.ensureUserProgressInitialized({
      userId: input.userId,
      trackerId: input.trackerId,
    })

    const [topics, subtopics] = await Promise.all([
      this.trackerRepository.getTopicsWithUserProgress({   // ← needs user progress
        trackerId: input.trackerId,
        userId: input.userId,
      }),
      this.trackerRepository.getSubtopicsWithUserProgress({ // ← already exists
        trackerId: input.trackerId,
        userId: input.userId,
      }),
    ])

    return {
      tracker,
      roadmap: buildRoadmapTree({ topics, subtopics }),
    }
  }
}