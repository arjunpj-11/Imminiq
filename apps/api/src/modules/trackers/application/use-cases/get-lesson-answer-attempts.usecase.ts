import { TrackerApplicationError } from '../tracker-application.error'
import type { ITrackerMapper } from '../tracker.mapper'
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface'

export interface IGetLessonAnswerAttemptsUseCase {
  execute(input: {
    trackerId: string
    subtopicId: string
    userId: string
  }): Promise<import("..").LessonAnswerAttemptsDTO>
}

export class GetLessonAnswerAttemptsUseCase implements IGetLessonAnswerAttemptsUseCase {
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

    const attempts = await this._trackerRepository.getLessonAnswerAttempts(input)

    return this._trackerMapper.toLessonAnswerAttemptsDto(attempts)
  }
}