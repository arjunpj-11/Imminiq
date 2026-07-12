import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { ITrackerMapper } from '../mappers/tracker.mapper'
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface'

export interface IGetLessonChatHistoryUseCase {
  execute(input: {
    trackerId: string
    subtopicId: string
    userId: string
  }): Promise<import("..").LessonChatHistoryDTO>
}

export class GetLessonChatHistoryUseCase implements IGetLessonChatHistoryUseCase {
  constructor(
    private readonly _trackerRepository: ITrackerRepository,
    private readonly _trackerMapper: ITrackerMapper,
  ) {}

  async execute(input: {
    trackerId: string
    subtopicId: string
    userId: string
  }) {
    const tracker = await this._trackerRepository.findOwnedTrackerById({
      trackerId: input.trackerId,
      userId: input.userId,
    })

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    const chatMessages = await this._trackerRepository.getLessonChatMessages({
      ...input,
      scope: 'lesson_doubt_chat',
    })

    return this._trackerMapper.toLessonChatHistoryDto(chatMessages)
  }
}