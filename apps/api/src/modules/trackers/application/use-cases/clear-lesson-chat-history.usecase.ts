// apps/api/src/modules/trackers/application/use-cases/clear-lesson-chat-history.usecase.ts

import { TrackerApplicationError } from '../tracker-application.error'
import type { ITrackerMapper } from '../tracker.mapper'
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface'

type ClearLessonChatHistoryResultDTO = ReturnType<
  ITrackerMapper['toClearLessonHistoryResultDto']
>

export interface IClearLessonChatHistoryUseCase {
  execute(input: {
    trackerId: string
    subtopicId: string
    userId: string
  }): Promise<ClearLessonChatHistoryResultDTO>
}

export class ClearLessonChatHistoryUseCase implements IClearLessonChatHistoryUseCase {
  constructor(
    private readonly _trackerRepository: ITrackerRepository,
    private readonly _trackerMapper: ITrackerMapper,
  ) {}

  async execute(input: {
    trackerId: string
    subtopicId: string
    userId: string
  }): Promise<ClearLessonChatHistoryResultDTO> {
    const tracker = await this._trackerRepository.findOwnedTrackerById({
      trackerId: input.trackerId,
      userId: input.userId,
    })

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    const result = await this._trackerRepository.clearLessonChatMessages(input)

    return this._trackerMapper.toClearLessonHistoryResultDto(result)
  }
}