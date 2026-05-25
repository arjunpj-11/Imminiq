// apps/api/src/modules/trackers/application/use-cases/get-lesson-generated-questions.usecase.ts

import { ApiError } from '../../../../shared/utils/ApiError'
import type { TrackerRepository } from '../../domain/repositories/tracker.repository.interface'

export class GetLessonGeneratedQuestionsUseCase {
  constructor(private readonly trackerRepository: TrackerRepository) {}

  async execute(input: {
    trackerId: string
    subtopicId: string
    userId: string
  }) {
    const tracker = await this.trackerRepository.findOwnedTrackerById(
      input.trackerId,
      input.userId
    )

    if (!tracker) {
      throw new ApiError(404, 'Tracker not found', 'TRACKER_NOT_FOUND')
    }

    return this.trackerRepository.getLessonGeneratedQuestions(input)
  }
}