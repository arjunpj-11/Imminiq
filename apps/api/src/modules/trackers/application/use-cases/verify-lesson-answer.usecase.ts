import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { ITrackerMapper } from '../mappers/tracker.mapper'
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface'
import type { ITrackerAIGateway } from '../../domain/services/tracker-ai.interface'

const getDocumentId = (document: unknown) => {
  const doc = document as { _id?: unknown }

  if (typeof doc._id === 'string') {
    return doc._id
  }

  if (doc._id && typeof doc._id === 'object' && 'toString' in doc._id) {
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

type VerifyLessonAnswerResultDTO = ReturnType<
  ITrackerMapper['toLessonAnswerVerificationDto']
>

const getIsCorrectFromResult = (result: {
  verdict?: 'correct' | 'partially_correct' | 'incorrect'
}) => {
  return result.verdict === 'correct'
}

export interface IVerifyLessonAnswerUseCase {
  execute(input: VerifyLessonAnswerInput): Promise<VerifyLessonAnswerResultDTO>
}

export class VerifyLessonAnswerUseCase implements IVerifyLessonAnswerUseCase {
  constructor(
    private readonly _trackerRepository: ITrackerRepository,
    private readonly _trackerAIGateway: ITrackerAIGateway,
    private readonly _trackerMapper: ITrackerMapper,
  ) {}

  async execute(
    input: VerifyLessonAnswerInput,
  ): Promise<VerifyLessonAnswerResultDTO> {
    const tracker = await this._trackerRepository.findOwnedTrackerById({
      trackerId: input.trackerId,
      userId: input.userId,
    })

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    const lesson = await this._trackerRepository.findLessonBySubtopicId({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
    })

    if (!lesson) {
      throw TrackerApplicationError.lessonNotGenerated(
        'Generate the lesson before verifying answer',
      )
    }

    const practiceTask = lesson.practiceTask as
      | {
          expectedAnswer?: string
        }
      | undefined

    const result = await this._trackerAIGateway.verifyNonCodingAnswer({
      lessonTitle: lesson.title || tracker.title || 'Lesson practice',
      lessonExplanation:
        lesson.explanation ||
        'The learner is answering a practice question from this tracker lesson.',
      question: input.question,
      expectedAnswer: practiceTask?.expectedAnswer || '',
      userAnswer: input.answer,
    })

    const isCorrect = getIsCorrectFromResult(result)

    await this._trackerRepository.createLessonAnswerAttempt({
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

    return this._trackerMapper.toLessonAnswerVerificationDto(result)
  }
}