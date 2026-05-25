import { ApiError } from '../../../../shared/utils/ApiError'
import { verifyTrackerTopic } from '../../../../infrastructure/ai/ai.service'
import type { TrackerRepository } from '../../domain/repositories/tracker.repository.interface'

type ExistingTopic = {
  id: string
  title: string
  description: string
}

type VerifyTrackerTopicInput = {
  trackerId: string
  userId: string
  trackerTitle: string
  topicTitle: string
  topicDescription: string
  existingTopics: ExistingTopic[]
}

export class VerifyTrackerTopicUseCase {
  constructor(
    private readonly trackerRepository: TrackerRepository
  ) {}

  async execute(input: VerifyTrackerTopicInput) {
    const tracker =
      await this.trackerRepository.findOwnedTrackerById(
        input.trackerId,
        input.userId
      )

    if (!tracker) {
      throw new ApiError(
        404,
        'Tracker not found',
        'TRACKER_NOT_FOUND'
      )
    }

    return verifyTrackerTopic({
      trackerTitle: input.trackerTitle || tracker.title || '',
      topicTitle: input.topicTitle,
      topicDescription: input.topicDescription,
      existingTopics: input.existingTopics,
    })
  }
}