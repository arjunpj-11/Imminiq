// apps/api/src/modules/trackers/application/use-cases/clear-lesson-question-solution-doubts.usecase.ts

import { createHash } from 'crypto'

import { ApiError } from '../../../../shared/utils/ApiError'
import type { TrackerRepository } from '../../domain/repositories/tracker.repository.interface'

const hashQuestion = (question: string) =>
  createHash('sha256').update(question.trim().toLowerCase()).digest('hex')

export class ClearLessonQuestionSolutionDoubtsUseCase {
  constructor(private readonly trackerRepository: TrackerRepository) {}

  async execute(input: {
    trackerId: string
    subtopicId: string
    userId: string
    question: string
  }) {
    const tracker = await this.trackerRepository.findOwnedTrackerById(
      input.trackerId,
      input.userId
    )

    if (!tracker) {
      throw new ApiError(404, 'Tracker not found', 'TRACKER_NOT_FOUND')
    }

    return this.trackerRepository.clearLessonQuestionSolutionDoubts({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
      questionHash: hashQuestion(input.question),
    })
  }
}