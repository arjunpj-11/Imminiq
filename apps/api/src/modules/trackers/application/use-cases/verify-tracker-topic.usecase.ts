import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { ITrackerMapper } from '../mappers/tracker.mapper'
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface'
import type { ITrackerAIGateway } from '../../domain/services/tracker-ai.interface'

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

type VerifyTrackerTopicResultDTO = ReturnType<
  ITrackerMapper['toTrackerAIValidationDto']
>

export class VerifyTrackerTopicUseCase {
  constructor(
    private readonly _trackerRepository: ITrackerRepository,
    private readonly _trackerAIGateway: ITrackerAIGateway,
    private readonly _trackerMapper: ITrackerMapper,
  ) {}

  async execute(
    input: VerifyTrackerTopicInput,
  ): Promise<VerifyTrackerTopicResultDTO> {
    const tracker = await this._trackerRepository.findOwnedTrackerById({
      trackerId: input.trackerId,
      userId: input.userId,
    })

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    const result = await this._trackerAIGateway.verifyTrackerTopic({
      trackerTitle: input.trackerTitle || tracker.title || '',
      topicTitle: input.topicTitle,
      topicDescription: input.topicDescription,
      existingTopics: input.existingTopics,
    })

    return this._trackerMapper.toTrackerAIValidationDto(result)
  }
}