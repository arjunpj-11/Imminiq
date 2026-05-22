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

    if (existingSubtopic.isLocked || existingSubtopic.status === 'locked') {
      throw new ApiError(403, 'Subtopic is locked', 'SUBTOPIC_LOCKED')
    }

    const subtopic = await this.trackerRepository.updateSubtopicProgress(input)

    if (!subtopic) {
      throw new ApiError(404, 'Subtopic not found', 'SUBTOPIC_NOT_FOUND')
    }

    if (input.status === 'completed') {
      await this.trackerRepository.unlockNextSubtopic({
        trackerId: input.trackerId,
        topicId: subtopic.topicId.toString(),
        completedSubtopicOrder: subtopic.order,
        parentSubtopicId: subtopic.parentSubtopicId
          ? subtopic.parentSubtopicId.toString()
          : null,
      })
    }

    const [topic, updatedTracker] = await Promise.all([
      this.trackerRepository.recomputeTopicProgress(subtopic.topicId.toString()),
      this.trackerRepository.recomputeTrackerProgress(input.trackerId),
    ])

    return {
      subtopic,
      topic,
      tracker: updatedTracker,
    }
  }
}
