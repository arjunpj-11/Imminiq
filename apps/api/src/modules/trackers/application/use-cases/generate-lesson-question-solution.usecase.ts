import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { ITrackerMapper } from '../mappers/tracker.mapper'
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface'
import type { ITrackerAIGateway } from '../../domain/services/tracker-ai.interface'
import type { IQuestionHasher } from '../../domain/services/question-hasher.interface'

type GenerateLessonQuestionSolutionResultDTO = ReturnType<
  ITrackerMapper['toLessonQuestionSolutionDto']
>

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

export interface IGenerateLessonQuestionSolutionUseCase {
  execute(input: {
    trackerId: string
    subtopicId: string
    userId: string
    question: string
  }): Promise<GenerateLessonQuestionSolutionResultDTO>
}

export class GenerateLessonQuestionSolutionUseCase implements IGenerateLessonQuestionSolutionUseCase {
  constructor(
    private readonly _trackerRepository: ITrackerRepository,
    private readonly _trackerAIGateway: ITrackerAIGateway,
    private readonly _questionHasher: IQuestionHasher,
    private readonly _trackerMapper: ITrackerMapper
  ) {}

  async execute(input: {
    trackerId: string
    subtopicId: string
    userId: string
    question: string
  }): Promise<GenerateLessonQuestionSolutionResultDTO> {
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
        'Generate the lesson before generating solution'
      )
    }

    const questionHash = this._questionHasher.hash(input.question)

    const existing = await this._trackerRepository.findLessonQuestionSolution({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
      questionHash,
    })

    if (existing) {
      return this._trackerMapper.toLessonQuestionSolutionDto(existing)
    }

    const solution = await this._trackerAIGateway.generateLessonQuestionSolution({
      lessonTitle: lesson.title,
      lessonExplanation: lesson.explanation,
      question: input.question,
    })

    const createdSolution =
      await this._trackerRepository.createLessonQuestionSolution({
        trackerId: input.trackerId,
        subtopicId: input.subtopicId,
        userId: input.userId,
        lessonId: getDocumentId(lesson),
        question: input.question,
        questionHash,
        solution,
      })

    return this._trackerMapper.toLessonQuestionSolutionDto(createdSolution)
  }
}