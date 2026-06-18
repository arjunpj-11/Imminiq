import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'
import type { TrackerAIServiceContract } from '../../domain/services/tracker-ai.service.interface'

const getDocumentId = (document: unknown) => {
  const doc = document as { _id?: unknown }

  if (typeof doc._id === 'string') return doc._id

  if (
    doc._id &&
    typeof doc._id === 'object' &&
    'toString' in doc._id
  ) {
    return doc._id.toString()
  }

  return null
}

type VerifyLessonAnswerInput = {
  trackerId: string
  subtopicId: string
  userId: string
  question: string
  answer: string
}

const getIsCorrectFromResult = (result: {
  verdict?: 'correct' | 'partially_correct' | 'incorrect'
}) => {
  return result.verdict === 'correct'
}

export class VerifyLessonAnswerUseCase {
  constructor(
    private readonly trackerRepository: TrackerRepositoryContract,
    private readonly trackerAIService: TrackerAIServiceContract
  ) {}

  async execute(input: VerifyLessonAnswerInput) {
    const tracker = await this.trackerRepository.findOwnedTrackerById(
      input.trackerId,
      input.userId
    )

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    const lesson = await this.trackerRepository.findLessonBySubtopicId({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
    })

    if (!lesson) {
      throw TrackerApplicationError.lessonNotGenerated('Generate the lesson before verifying answer')
    }

    const practiceTask = lesson.practiceTask as {
      expectedAnswer?: string
    } | undefined

    const result = await this.trackerAIService.verifyNonCodingAnswer({
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
      lessonId: getDocumentId(lesson),
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
