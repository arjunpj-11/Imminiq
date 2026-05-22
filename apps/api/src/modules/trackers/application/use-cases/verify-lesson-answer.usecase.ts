// apps/api/src/modules/trackers/application/use-cases/verify-lesson-answer.usecase.ts

import { ApiError } from '../../../../shared/utils/ApiError'
import { verifyNonCodingAnswer } from '../../../../infrastructure/ai/ai.service'
import type { TrackerRepository } from '../../domain/repositories/tracker.repository.interface'

type VerifyLessonAnswerInput = {
  trackerId: string
  subtopicId: string
  userId: string
  question: string
  answer: string
}

export class VerifyLessonAnswerUseCase {
  constructor(
    private readonly trackerRepository: TrackerRepository
  ) {}

  async execute(input: VerifyLessonAnswerInput) {
    const tracker =
      await this.trackerRepository.findOwnedTrackerById(
        input.trackerId,
        input.userId
      )

    if (!tracker) {
      throw new ApiError(
        404,
        'Tracker not found',
        'TRACKER_NOT_FOUND'
      )
    }

    const lesson =
      await this.trackerRepository.findGeneratedLessonBySubtopic({
        trackerId: input.trackerId,
        subtopicId: input.subtopicId,
        userId: input.userId,
      })

    return verifyNonCodingAnswer({
      lessonTitle: lesson?.title || tracker.title || 'Lesson practice',
      lessonExplanation:
        lesson?.explanation ||
        'The learner is answering a practice question from this tracker lesson.',
      question: input.question,
      expectedAnswer: lesson?.practiceTask?.expectedAnswer || '',
      userAnswer: input.answer,
    })
  }
}