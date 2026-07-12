import { TrackerApplicationError } from '../tracker-application.error'
import type { ITrackerMapper } from '../tracker.mapper'
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface'

export interface IGetLessonGeneratedQuestionsUseCase {
  execute(input: {
    trackerId: string
    subtopicId: string
    userId: string
  }): Promise<unknown>
}

export class GetLessonGeneratedQuestionsUseCase implements IGetLessonGeneratedQuestionsUseCase {
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

    const generatedQuestions =
      await this._trackerRepository.getLessonGeneratedQuestions(input)

    return this._trackerMapper.toLessonGeneratedQuestionsDto(generatedQuestions)
  }
}