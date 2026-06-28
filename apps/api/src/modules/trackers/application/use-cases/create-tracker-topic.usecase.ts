import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerMapperContract } from '../mappers/tracker.mapper'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'
import type { CreateTopicUseCaseInput } from '../../domain/types/trackers.types'

type CreateTrackerTopicResultDto = ReturnType<
  TrackerMapperContract['toTrackerTopicDto']
>

export class CreateTrackerTopicUseCase {
  constructor(
    private readonly _trackerRepository: TrackerRepositoryContract,
    private readonly _trackerMapper: TrackerMapperContract
  ) {}

  async execute(
    input: CreateTopicUseCaseInput
  ): Promise<CreateTrackerTopicResultDto> {
    const tracker = await this._trackerRepository.findOwnedTrackerById({
      trackerId: input.trackerId,
      userId: input.userId,
    })

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    const lastTopic = await this._trackerRepository.findLastTopicForTracker(
      input.trackerId
    )

    const topic = await this._trackerRepository.createTrackerTopic({
      trackerId: input.trackerId,
      title: input.title,
      description: input.description || '',
      order: (lastTopic?.order || 0) + 1,
    })

    await this._trackerRepository.incrementTrackerTopicsCount(input.trackerId)

    return this._trackerMapper.toTrackerTopicDto(topic)
  }
}