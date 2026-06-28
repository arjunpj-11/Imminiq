import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerMapperContract } from '../mappers/tracker.mapper'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'
import type { CreateSubtopicUseCaseInput } from '../../domain/types/trackers.types'

type CreateTrackerSubtopicResultDto = ReturnType<
  TrackerMapperContract['toTrackerSubtopicDto']
>

export class CreateTrackerSubtopicUseCase {
  constructor(
    private readonly _trackerRepository: TrackerRepositoryContract,
    private readonly _trackerMapper: TrackerMapperContract
  ) {}

  async execute(
    input: CreateSubtopicUseCaseInput
  ): Promise<CreateTrackerSubtopicResultDto> {
    const tracker = await this._trackerRepository.findOwnedTrackerById({
      trackerId: input.trackerId,
      userId: input.userId,
    })

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    const topics = await this._trackerRepository.getTopicsForTracker(
      input.trackerId
    )

    const topicExists = topics.some((topic) => {
      return topic._id.toString() === input.topicId
    })

    if (!topicExists) {
      throw TrackerApplicationError.topicNotFound('Topic not found')
    }

    let depth = 1

    if (input.parentSubtopicId) {
      const parent = await this._trackerRepository.getSubtopicById({
        trackerId: input.trackerId,
        subtopicId: input.parentSubtopicId,
      })

      if (!parent) {
        throw TrackerApplicationError.parentSubtopicNotFound(
          'Parent subtopic not found'
        )
      }

      if (parent.topicId.toString() !== input.topicId) {
        throw TrackerApplicationError.parentTopicMismatch(
          'Parent subtopic does not belong to this topic'
        )
      }

      depth = parent.depth + 1
    }

    const parentSubtopicId = input.parentSubtopicId || null

    const lastSibling = await this._trackerRepository.findLastSiblingSubtopic({
      topicId: input.topicId,
      parentSubtopicId,
    })

    const subtopic = await this._trackerRepository.createTrackerSubtopic({
      trackerId: input.trackerId,
      topicId: input.topicId,
      parentSubtopicId,
      title: input.title,
      description: input.description || '',
      order: (lastSibling?.order || 0) + 1,
      depth,
      estimatedMinutes: input.estimatedMinutes || 0,
    })

    await Promise.all([
      this._trackerRepository.incrementTrackerSubtopicsCount(input.trackerId),
      this._trackerRepository.recomputeTrackerProgress({
        trackerId: input.trackerId,
        userId: input.userId,
      }),
    ])

    return this._trackerMapper.toTrackerSubtopicDto(subtopic)
  }
}