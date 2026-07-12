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

export class GenerateLessonVisualizationUseCase {
  constructor(
    private readonly _trackerRepository: ITrackerRepository,
    private readonly _trackerAIGateway: ITrackerAIGateway,
    private readonly _trackerMapper: ITrackerMapper
  ) {}

  async execute(input: {
    trackerId: string
    subtopicId: string
    userId: string
    regenerate?: boolean
  }) {
    const tracker = await this._trackerRepository.findOwnedTrackerById({
      trackerId: input.trackerId,
      userId: input.userId,
    })

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    if (!input.regenerate) {
      const cached = await this._trackerRepository.findLessonVisualization({
        trackerId: input.trackerId,
        subtopicId: input.subtopicId,
        userId: input.userId,
      })

      if (cached) {
        return this._trackerMapper.toLessonVisualizationDto(cached)
      }
    }

    const lesson = await this._trackerRepository.findLessonBySubtopicId({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
    })

    if (!lesson) {
      throw TrackerApplicationError.lessonNotGenerated(
        'Generate the lesson before visualizing'
      )
    }

    const result = await this._trackerAIGateway.generateLessonVisualization({
      title: lesson.title,
      summary: lesson.summary,
      explanation: lesson.explanation,
      lessonType: lesson.lessonType,
      tags: lesson.tags ?? [],
      difficulty: lesson.difficulty,
      codeExample: lesson.codeExample,
    })

    const savedVisualization =
      await this._trackerRepository.saveLessonVisualization({
        trackerId: input.trackerId,
        subtopicId: input.subtopicId,
        userId: input.userId,
        lessonId: getDocumentId(lesson),
        html: result.html,
        visualTitle: result.visualTitle,
        visualDescription: result.visualDescription,
      })

    return this._trackerMapper.toLessonVisualizationDto(savedVisualization)
  }
}