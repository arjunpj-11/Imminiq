import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerMapperContract } from '../mappers/tracker.mapper'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'
import type { CreateTopicUseCaseInput } from '../../domain/types/trackers.types'

type CreateTrackerTopicResultDto = ReturnType<
  TrackerMapperContract['toTrackerTopicDto']
>

export class CreateTrackerTopicUseCase {
  constructor(
    private readonly trackerRepository: TrackerRepositoryContract,
    private readonly trackerMapper: TrackerMapperContract
  ) {}

  async execute(
    input: CreateTopicUseCaseInput
  ): Promise<CreateTrackerTopicResultDto> {
    const tracker = await this.trackerRepository.findOwnedTrackerById(
      input.trackerId,
      input.userId
    )

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
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

    return this.trackerMapper.toTrackerTopicDto(topic)
  }
}