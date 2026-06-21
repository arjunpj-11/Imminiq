import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerMapperContract } from '../mappers/tracker.mapper'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'
import type { TrackerAIServiceContract } from '../../domain/services/tracker-ai.service.interface'

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
    const tracker = await this.trackerRepository.findOwnedTrackerById(
      input.trackerId,
      input.userId
    )

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
        return cached
      }
    }

    const lesson = await this.trackerRepository.findLessonBySubtopicId({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
    })

    if (!lesson) {
      throw TrackerApplicationError.lessonNotGenerated('Generate the lesson before visualizing')
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

    await this.trackerRepository.saveLessonVisualization({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
      lessonId: lesson._id?.toString?.() ?? null,
      html: result.html,
      visualTitle: result.visualTitle,
      visualDescription: result.visualDescription,
    })

    return this.trackerMapper.toLessonVisualizationDto(result)
  }
}
