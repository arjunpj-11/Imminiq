// apps/api/src/modules/trackers/application/use-cases/clear-lesson-question-solution-doubts.usecase.ts

import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerMapperContract } from '../mappers/tracker.mapper'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'
import type { QuestionHasherContract } from '../../domain/services/question-hasher.interface'

type ClearLessonQuestionSolutionDoubtsResultDto = ReturnType<
  TrackerMapperContract['toClearLessonHistoryResultDto']
>

export class ClearLessonQuestionSolutionDoubtsUseCase {
  constructor(
    private readonly _trackerRepository: TrackerRepositoryContract,
    private readonly _questionHasher: QuestionHasherContract,
    private readonly _trackerMapper: TrackerMapperContract,
  ) {}

  async execute(input: {
    trackerId: string
    subtopicId: string
    userId: string
    question: string
  }): Promise<ClearLessonQuestionSolutionDoubtsResultDto> {
    const tracker = await this._trackerRepository.findOwnedTrackerById({
      trackerId: input.trackerId,
      userId: input.userId,
    })

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    const result =
      await this._trackerRepository.clearLessonQuestionSolutionDoubts({
        trackerId: input.trackerId,
        subtopicId: input.subtopicId,
        userId: input.userId,
        questionHash: this._questionHasher.hash(input.question),
      })

    return this._trackerMapper.toClearLessonHistoryResultDto(result)
  }
}