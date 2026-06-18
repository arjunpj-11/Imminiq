import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'
import type { TrackerAIServiceContract } from '../../domain/services/tracker-ai.service.interface'

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
    private readonly trackerRepository: TrackerRepositoryContract,
    private readonly trackerAIService: TrackerAIServiceContract
  ) {}

  async execute(input: VerifyTrackerTopicInput) {
    const tracker = await this.trackerRepository.findOwnedTrackerById(
      input.trackerId,
      input.userId
    )

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    return this.trackerAIService.verifyTrackerTopic({
      trackerTitle: input.trackerTitle || tracker.title || '',
      topicTitle: input.topicTitle,
      topicDescription: input.topicDescription,
      existingTopics: input.existingTopics,
    })
  }
}
