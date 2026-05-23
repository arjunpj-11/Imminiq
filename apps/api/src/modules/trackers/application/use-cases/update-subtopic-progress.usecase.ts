// apps/api/src/modules/trackers/application/use-cases/update-subtopic-progress.usecase.ts

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

    // Ensure the user's progress is initialized before we try to update it
    await this.trackerRepository.ensureUserProgressInitialized({
      userId: input.userId,
      trackerId: input.trackerId,
    })

    // 1. Mark this subtopic completed/in_progress for this user
    const subtopic = await this.trackerRepository.updateSubtopicProgress(input)
    if (!subtopic) {
      throw new ApiError(404, 'Subtopic not found', 'SUBTOPIC_NOT_FOUND')
    }

    if (input.status === 'completed') {
      // 2. Unlock the next depth-1 sibling for this user
      if (subtopic.depth === 1) {
        await this.trackerRepository.unlockNextSubtopic({
          trackerId: input.trackerId,
          topicId: subtopic.topicId.toString(),
          completedSubtopicOrder: subtopic.order,
          parentSubtopicId: null,
          userId: input.userId,           // ✅ per-user unlock
        })
      }

      // 3. If this is a child node, check if parent is now fully complete
      if (subtopic.parentSubtopicId) {
        await this.trackerRepository.checkAndCompleteParentSubtopic({
          trackerId: input.trackerId,
          topicId: subtopic.topicId.toString(),
          parentSubtopicId: subtopic.parentSubtopicId.toString(),
          userId: input.userId,           // ✅ per-user check
        })
      }

      // 4. Check if the whole topic is now complete for this user
      await this.trackerRepository.checkAndCompleteTopicAndUnlockNext({
        trackerId: input.trackerId,
        topicId: subtopic.topicId.toString(),
        userId: input.userId,             // ✅ per-user check
      })
    }

    // 5. Recompute this user's overall tracker progress
    const updatedProgress = await this.trackerRepository.recomputeTrackerProgress(
      input.trackerId,
      input.userId                        // ✅ per-user recompute
    )

    return { subtopic, progress: updatedProgress }
  }
}