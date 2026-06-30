import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerMapperContract } from '../mappers/tracker.mapper'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'
import type { TrackerAIServiceContract } from '../../domain/services/tracker-ai.service.interface'
import type { QuestionHasherServiceContract } from '../../domain/services/question-hasher.service.interface'

type GenerateLessonQuestionSolutionResultDto = ReturnType<
  TrackerMapperContract['toLessonQuestionSolutionDto']
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

export class GenerateLessonQuestionSolutionUseCase {
  constructor(
    private readonly _trackerRepository: TrackerRepositoryContract,
    private readonly _trackerAIService: TrackerAIServiceContract,
    private readonly _questionHasher: QuestionHasherServiceContract,
    private readonly _trackerMapper: TrackerMapperContract
  ) {}

  async execute(input: {
    trackerId: string
    subtopicId: string
    userId: string
    question: string
  }): Promise<GenerateLessonQuestionSolutionResultDto> {
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

    const solution = await this._trackerAIService.generateLessonQuestionSolution({
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