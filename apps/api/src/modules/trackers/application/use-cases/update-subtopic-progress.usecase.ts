import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerMapperContract } from '../mappers/tracker.mapper'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'
import type { UpdateSubtopicProgressInput } from '../../domain/types/trackers.types'

type UpdateSubtopicProgressResultDto = ReturnType<
  TrackerMapperContract['toSubtopicProgressResultDto']
>

export class UpdateSubtopicProgressUseCase {
  constructor(
    private readonly _trackerRepository: TrackerRepositoryContract,
    private readonly _trackerMapper: TrackerMapperContract,
  ) {}

  async execute(
    input: UpdateSubtopicProgressInput,
  ): Promise<UpdateSubtopicProgressResultDto> {
    const tracker = await this._trackerRepository.findOwnedTrackerById({
      trackerId: input.trackerId,
      userId: input.userId,
    })

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    const existingSubtopic = await this._trackerRepository.getSubtopicById({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
    })

    if (!existingSubtopic) {
      throw TrackerApplicationError.subtopicNotFound('Subtopic not found')
    }

    await this._trackerRepository.ensureUserProgressInitialized({
      userId: input.userId,
      trackerId: input.trackerId,
    })

    const subtopic = await this._trackerRepository.updateSubtopicProgress(input)

    if (!subtopic) {
      throw TrackerApplicationError.subtopicNotFound('Subtopic not found')
    }

    if (input.status === 'completed') {
      if (subtopic.depth === 1) {
        await this._trackerRepository.unlockNextSubtopic({
          trackerId: input.trackerId,
          topicId: subtopic.topicId.toString(),
          completedSubtopicOrder: subtopic.order,
          parentSubtopicId: null,
          userId: input.userId,
        })
      }

      if (subtopic.parentSubtopicId) {
        await this._trackerRepository.checkAndCompleteParentSubtopic({
          trackerId: input.trackerId,
          topicId: subtopic.topicId.toString(),
          parentSubtopicId: subtopic.parentSubtopicId.toString(),
          userId: input.userId,
        })
      }

      await this._trackerRepository.checkAndCompleteTopicAndUnlockNext({
        trackerId: input.trackerId,
        topicId: subtopic.topicId.toString(),
        userId: input.userId,
      })
    }

    const updatedProgress =
      await this._trackerRepository.recomputeTrackerProgress({
        trackerId: input.trackerId,
        userId: input.userId,
      })

    return this._trackerMapper.toSubtopicProgressResultDto({
      subtopic,
      progress: updatedProgress,
    })
  }
}