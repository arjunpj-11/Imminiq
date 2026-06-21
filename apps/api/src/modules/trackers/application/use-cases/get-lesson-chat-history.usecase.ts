import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerMapperContract } from '../mappers/tracker.mapper'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'

export class GetLessonChatHistoryUseCase {
  constructor(
    private readonly trackerRepository: TrackerRepositoryContract,
    private readonly trackerMapper: TrackerMapperContract,
  ) {}

  async execute(input: {
    trackerId: string
    subtopicId: string
    userId: string
  }) {
    const tracker = await this.trackerRepository.findOwnedTrackerById({
      trackerId: input.trackerId,
      userId: input.userId,
    })

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    const chatMessages = await this.trackerRepository.getLessonChatMessages({
      ...input,
      scope: 'lesson_doubt_chat',
    })

    return this.trackerMapper.toLessonChatHistoryDto(chatMessages)
  }
}