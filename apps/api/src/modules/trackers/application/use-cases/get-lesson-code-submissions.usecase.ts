import { TrackerApplicationError } from '../tracker-application.error'
import type { ITrackerMapper } from '../tracker.mapper'
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface'

export interface IGetLessonCodeSubmissionsUseCase {
  execute(input: {
    trackerId: string
    subtopicId: string
    userId: string
    action?: 'run' | 'submit'
  }): Promise<import("..").LessonCodeSubmissionsDTO>
}

export class GetLessonCodeSubmissionsUseCase implements IGetLessonCodeSubmissionsUseCase {
  constructor(
    private readonly _trackerRepository: Pick<ITrackerRepository, 'findOwnedTrackerById' | 'getLessonCodeSubmissions'>,
    private readonly _trackerMapper: ITrackerMapper,
  ) {}

  async execute(input: {
    trackerId: string
    subtopicId: string
    userId: string
    action?: 'run' | 'submit'
  }) {
    const tracker = await this._trackerRepository.findOwnedTrackerById({
      trackerId: input.trackerId,
      userId: input.userId,
    })

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    const submissions =
      await this._trackerRepository.getLessonCodeSubmissions(input)

    return this._trackerMapper.toLessonCodeSubmissionsDto(submissions)
  }
}
