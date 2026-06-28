import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerMapperContract } from '../mappers/tracker.mapper'
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

type VerifyTrackerTopicResultDto = ReturnType<
  TrackerMapperContract['toTrackerAIValidationDto']
>

export class VerifyTrackerTopicUseCase {
  constructor(
    private readonly _trackerRepository: TrackerRepositoryContract,
    private readonly _trackerAIService: TrackerAIServiceContract,
    private readonly _trackerMapper: TrackerMapperContract,
  ) {}

  async execute(
    input: VerifyTrackerTopicInput,
  ): Promise<VerifyTrackerTopicResultDto> {
    const tracker = await this._trackerRepository.findOwnedTrackerById({
      trackerId: input.trackerId,
      userId: input.userId,
    })

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    const result = await this._trackerAIService.verifyTrackerTopic({
      trackerTitle: input.trackerTitle || tracker.title || '',
      topicTitle: input.topicTitle,
      topicDescription: input.topicDescription,
      existingTopics: input.existingTopics,
    })

    return this._trackerMapper.toTrackerAIValidationDto(result)
  }
}