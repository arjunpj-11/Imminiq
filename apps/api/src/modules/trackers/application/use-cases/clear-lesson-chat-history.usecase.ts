// apps/api/src/modules/trackers/application/use-cases/clear-lesson-chat-history.usecase.ts

import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerMapperContract } from '../mappers/tracker.mapper'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'

type ClearLessonChatHistoryResultDto = ReturnType<
  TrackerMapperContract['toClearLessonHistoryResultDto']
>

export class ClearLessonChatHistoryUseCase {
  constructor(
    private readonly trackerRepository: TrackerRepositoryContract,
    private readonly trackerMapper: TrackerMapperContract
  ) {}

  async execute(input: {
    trackerId: string
    subtopicId: string
    userId: string
  }): Promise<ClearLessonChatHistoryResultDto> {
    const tracker = await this.trackerRepository.findOwnedTrackerById(
      input.trackerId,
      input.userId
    )

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    const result = await this.trackerRepository.clearLessonChatMessages(input)

    return this.trackerMapper.toClearLessonHistoryResultDto(result)
  }
}