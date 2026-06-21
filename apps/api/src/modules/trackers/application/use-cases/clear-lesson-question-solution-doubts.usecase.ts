// apps/api/src/modules/trackers/application/use-cases/clear-lesson-question-solution-doubts.usecase.ts

import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerMapperContract } from '../mappers/tracker.mapper'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'
import type { QuestionHasherServiceContract } from '../../domain/services/question-hasher.service.interface'

type ClearLessonQuestionSolutionDoubtsResultDto = ReturnType<
  TrackerMapperContract['toClearLessonHistoryResultDto']
>

export class ClearLessonQuestionSolutionDoubtsUseCase {
  constructor(
    private readonly trackerRepository: TrackerRepositoryContract,
    private readonly questionHasher: QuestionHasherServiceContract,
    private readonly trackerMapper: TrackerMapperContract,
  ) {}

  async execute(input: {
    trackerId: string
    subtopicId: string
    userId: string
    question: string
  }): Promise<ClearLessonQuestionSolutionDoubtsResultDto> {
    const tracker = await this.trackerRepository.findOwnedTrackerById({
      trackerId: input.trackerId,
      userId: input.userId,
    })

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    const result =
      await this.trackerRepository.clearLessonQuestionSolutionDoubts({
        trackerId: input.trackerId,
        subtopicId: input.subtopicId,
        userId: input.userId,
        questionHash: this.questionHasher.hash(input.question),
      })

    return this.trackerMapper.toClearLessonHistoryResultDto(result)
  }
}