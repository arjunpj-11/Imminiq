import { ApiError } from '../../../../shared/utils/ApiError'
import type { TrackerRepository } from '../../domain/repositories/tracker.repository.interface'
import type { UpdateSubtopicProgressInput } from '../../domain/types/trackers.types'

export class UpdateSubtopicProgressUseCase {
  constructor(private readonly trackerRepository: TrackerRepository) {}

  async execute(input: UpdateSubtopicProgressInput) {
    const tracker = await this.trackerRepository.findOwnedTrackerById(
      input.trackerId,
      input.userId
    )
    if (!tracker) {
      throw new ApiError(404, 'Tracker not found', 'TRACKER_NOT_FOUND')
    }

    const existingSubtopic = await this.trackerRepository.getSubtopicById({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
    })
    if (!existingSubtopic) {
      throw new ApiError(404, 'Subtopic not found', 'SUBTOPIC_NOT_FOUND')
    }

    await this.trackerRepository.ensureUserProgressInitialized({
      userId: input.userId,
      trackerId: input.trackerId,
    })

    const subtopic = await this.trackerRepository.updateSubtopicProgress(input)
    if (!subtopic) {
      throw new ApiError(404, 'Subtopic not found', 'SUBTOPIC_NOT_FOUND')
    }

    if (input.status === 'completed') {
      if (subtopic.depth === 1) {
        await this.trackerRepository.unlockNextSubtopic({
          trackerId: input.trackerId,
          topicId: subtopic.topicId.toString(),
          completedSubtopicOrder: subtopic.order,
          parentSubtopicId: null,
          userId: input.userId,
        })
      }

      if (subtopic.parentSubtopicId) {
        await this.trackerRepository.checkAndCompleteParentSubtopic({
          trackerId: input.trackerId,
          topicId: subtopic.topicId.toString(),
          parentSubtopicId: subtopic.parentSubtopicId.toString(),
          userId: input.userId,
        })
      }

      await this.trackerRepository.checkAndCompleteTopicAndUnlockNext({
        trackerId: input.trackerId,
        topicId: subtopic.topicId.toString(),
        userId: input.userId,
      })
    }

    const updatedProgress = await this.trackerRepository.recomputeTrackerProgress(
      input.trackerId,
      input.userId
    )

    return { subtopic, progress: updatedProgress }
  }
}
