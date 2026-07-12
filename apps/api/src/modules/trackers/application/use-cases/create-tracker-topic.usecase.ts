import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { ITrackerMapper } from '../mappers/tracker.mapper'
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface'
import type { CreateTopicUseCaseInput } from '../../domain/types/trackers.types'

type CreateTrackerTopicResultDTO = ReturnType<
  ITrackerMapper['toTrackerTopicDto']
>

export interface ICreateTrackerTopicUseCase {
  execute(input: CreateTopicUseCaseInput): Promise<CreateTrackerTopicResultDTO>
}

export class CreateTrackerTopicUseCase implements ICreateTrackerTopicUseCase {
  constructor(
    private readonly _trackerRepository: ITrackerRepository,
    private readonly _trackerMapper: ITrackerMapper
  ) {}

  async execute(
    input: CreateTopicUseCaseInput
  ): Promise<CreateTrackerTopicResultDTO> {
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