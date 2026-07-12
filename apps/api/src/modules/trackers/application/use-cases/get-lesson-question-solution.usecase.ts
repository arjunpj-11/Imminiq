import { TrackerApplicationError } from '../tracker-application.error'
import type { ITrackerMapper } from '../tracker.mapper'
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface'
import type { IQuestionHasher } from '../../domain/services/question-hasher.interface'

export interface IGetLessonQuestionSolutionUseCase {
  execute(input: {
    trackerId: string
    subtopicId: string
    userId: string
    question: string
  }): Promise<unknown>
}

export class GetLessonQuestionSolutionUseCase implements IGetLessonQuestionSolutionUseCase {
  constructor(
    private readonly _trackerRepository: ITrackerRepository,
    private readonly _questionHasher: IQuestionHasher,
    private readonly _trackerMapper: ITrackerMapper,
  ) {}

  async execute(input: {
    trackerId: string
    subtopicId: string
    userId: string
    question: string
  }) {
    const tracker = await this._trackerRepository.findOwnedTrackerById({
      trackerId: input.trackerId,
      userId: input.userId,
    })

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    const solution = await this._trackerRepository.findLessonQuestionSolution({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
      questionHash: this._questionHasher.hash(input.question),
    })

    return this._trackerMapper.toLessonQuestionSolutionDto(solution)
  }
}