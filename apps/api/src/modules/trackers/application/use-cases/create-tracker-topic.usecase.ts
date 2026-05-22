import { ApiError } from '../../../../shared/utils/ApiError'
import type { TrackerRepository } from '../../domain/repositories/tracker.repository.interface'
import type { CreateTopicUseCaseInput } from '../../domain/types/trackers.types'

export class CreateTrackerTopicUseCase {
  constructor(private readonly trackerRepository: TrackerRepository) {}

  async execute(input: CreateTopicUseCaseInput) {
    const tracker = await this.trackerRepository.findOwnedTrackerById(
      input.trackerId,
      input.userId
    )

    if (!tracker) {
      throw new ApiError(404, 'Tracker not found', 'TRACKER_NOT_FOUND')
    }

    const lastTopic = await this.trackerRepository.findLastTopicForTracker(
      input.trackerId
    )

    const topic = await this.trackerRepository.createTrackerTopic({
      trackerId: input.trackerId,
      title: input.title,
      description: input.description || '',
      order: (lastTopic?.order || 0) + 1,
    })

    await this.trackerRepository.incrementTrackerTopicsCount(input.trackerId)

    return topic
  }
}
