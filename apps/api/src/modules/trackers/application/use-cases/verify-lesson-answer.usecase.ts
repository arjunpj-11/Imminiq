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

const getLessonId = (lesson: unknown) => {
  const lessonWithId = lesson as { _id?: unknown }

  if (typeof lessonWithId._id === 'string') {
    return lessonWithId._id
  }

  if (
    lessonWithId._id &&
    typeof lessonWithId._id === 'object' &&
    'toString' in lessonWithId._id
  ) {
    return lessonWithId._id.toString()
  }

  return null
}

const getIsCorrectFromResult = (result: {
  verdict?: 'correct' | 'partially_correct' | 'incorrect'
}) => {
  return result.verdict === 'correct'
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
      await this.trackerRepository.findLessonBySubtopicId({
        trackerId: input.trackerId,
        subtopicId: input.subtopicId,
        userId: input.userId,
      })

    if (!lesson) {
      throw new ApiError(
        404,
        'Generate the lesson before verifying answer',
        'LESSON_NOT_GENERATED'
      )
    }

 const practiceTask = lesson.practiceTask as {
  expectedAnswer?: string
} | undefined

const result = await verifyNonCodingAnswer({
  lessonTitle: lesson.title || tracker.title || 'Lesson practice',
  lessonExplanation:
    lesson.explanation ||
    'The learner is answering a practice question from this tracker lesson.',
  question: input.question,
  expectedAnswer: practiceTask?.expectedAnswer || '',
  userAnswer: input.answer,
})

    const isCorrect = getIsCorrectFromResult(result)

    await this.trackerRepository.createLessonAnswerAttempt({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
      lessonId: getLessonId(lesson),
      question: input.question,
      answer: input.answer,
      feedback: result,
      isCorrect,
      score:
        typeof result.score === 'number'
          ? result.score
          : isCorrect
            ? 100
            : 0,
    })

    return result
  }
}