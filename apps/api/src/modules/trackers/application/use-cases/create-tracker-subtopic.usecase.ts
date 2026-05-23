// apps/api/src/modules/trackers/application/use-cases/create-tracker-subtopic.usecase.ts

import { ApiError } from '../../../../shared/utils/ApiError'
import type { TrackerRepository } from '../../domain/repositories/tracker.repository.interface'
import type { CreateSubtopicUseCaseInput } from '../../domain/types/trackers.types'

export class CreateTrackerSubtopicUseCase {
  constructor(private readonly trackerRepository: TrackerRepository) {}

  async execute(input: CreateSubtopicUseCaseInput) {
    const tracker = await this.trackerRepository.findOwnedTrackerById(
      input.trackerId,
      input.userId
    )

    if (!tracker) {
      throw new ApiError(404, 'Tracker not found', 'TRACKER_NOT_FOUND')
    }

    const topics = await this.trackerRepository.getTopicsForTracker(
      input.trackerId
    )

    const topicExists = topics.some((topic) => {
      return topic._id.toString() === input.topicId
    })

    if (!topicExists) {
      throw new ApiError(404, 'Topic not found', 'TOPIC_NOT_FOUND')
    }

    let depth = 1

    if (input.parentSubtopicId) {
      const parent = await this.trackerRepository.getSubtopicById({
        trackerId: input.trackerId,
        subtopicId: input.parentSubtopicId,
      })

      if (!parent) {
        throw new ApiError(
          404,
          'Parent subtopic not found',
          'PARENT_SUBTOPIC_NOT_FOUND'
        )
      }

      if (parent.topicId.toString() !== input.topicId) {
        throw new ApiError(
          400,
          'Parent subtopic does not belong to this topic',
          'PARENT_TOPIC_MISMATCH'
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
      // FIX: pass input.userId as required second argument
      this.trackerRepository.recomputeTrackerProgress(input.trackerId, input.userId),
    ])

    return subtopic
  }
}