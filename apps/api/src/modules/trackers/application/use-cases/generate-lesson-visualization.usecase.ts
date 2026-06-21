import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerMapperContract } from '../mappers/tracker.mapper'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'
import type { TrackerAIServiceContract } from '../../domain/services/tracker-ai.service.interface'

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
    private readonly trackerRepository: TrackerRepositoryContract,
    private readonly trackerAIService: TrackerAIServiceContract,
    private readonly trackerMapper: TrackerMapperContract
  ) {}

  async execute(input: {
    trackerId: string
    subtopicId: string
    userId: string
    regenerate?: boolean
  }) {
    const tracker = await this.trackerRepository.findOwnedTrackerById({
      trackerId: input.trackerId,
      userId: input.userId,
    })

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    if (!input.regenerate) {
      const cached = await this.trackerRepository.findLessonVisualization({
        trackerId: input.trackerId,
        subtopicId: input.subtopicId,
        userId: input.userId,
      })

      if (cached) {
        return this.trackerMapper.toLessonVisualizationDto(cached)
      }
    }

    const lesson = await this.trackerRepository.findLessonBySubtopicId({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
    })

    if (!lesson) {
      throw TrackerApplicationError.lessonNotGenerated(
        'Generate the lesson before visualizing'
      )
    }

    const result = await this.trackerAIService.generateLessonVisualization({
      title: lesson.title,
      summary: lesson.summary,
      explanation: lesson.explanation,
      lessonType: lesson.lessonType,
      tags: lesson.tags ?? [],
      difficulty: lesson.difficulty,
      codeExample: lesson.codeExample,
    })

    const savedVisualization =
      await this.trackerRepository.saveLessonVisualization({
        trackerId: input.trackerId,
        subtopicId: input.subtopicId,
        userId: input.userId,
        lessonId: getDocumentId(lesson),
        html: result.html,
        visualTitle: result.visualTitle,
        visualDescription: result.visualDescription,
      })

    return this.trackerMapper.toLessonVisualizationDto(savedVisualization)
  }
}