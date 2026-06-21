import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerMapperContract } from '../mappers/tracker.mapper'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'
import type { CreateSubtopicUseCaseInput } from '../../domain/types/trackers.types'

type CreateTrackerSubtopicResultDto = ReturnType<
  TrackerMapperContract['toTrackerSubtopicDto']
>

export class CreateTrackerSubtopicUseCase {
  constructor(
    private readonly trackerRepository: TrackerRepositoryContract,
    private readonly trackerMapper: TrackerMapperContract
  ) {}

  async execute(
    input: CreateSubtopicUseCaseInput
  ): Promise<CreateTrackerSubtopicResultDto> {
    const tracker = await this.trackerRepository.findOwnedTrackerById(
      input.trackerId,
      input.userId
    )

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    const topics = await this.trackerRepository.getTopicsForTracker(
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
      const parent = await this.trackerRepository.getSubtopicById({
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

    const lastSibling = await this.trackerRepository.findLastSiblingSubtopic({
      topicId: input.topicId,
      parentSubtopicId,
    })

    const subtopic = await this.trackerRepository.createTrackerSubtopic({
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
      this.trackerRepository.incrementTrackerSubtopicsCount(input.trackerId),
      this.trackerRepository.recomputeTrackerProgress(
        input.trackerId,
        input.userId
      ),
    ])

    return this.trackerMapper.toTrackerSubtopicDto(subtopic)
  }
}