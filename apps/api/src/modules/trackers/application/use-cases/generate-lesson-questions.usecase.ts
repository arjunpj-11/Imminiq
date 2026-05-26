import { ApiError } from '../../../../shared/utils/ApiError'
import type { TrackerRepository } from '../../domain/repositories/tracker.repository.interface'
import type { TrackerAIServiceContract } from '../../domain/services/tracker-ai.service.interface'
import { getDocumentId, hashQuestion } from '../utils/tracker-question.util'

export class GenerateLessonQuestionsUseCase {
  constructor(
    private readonly trackerRepository: TrackerRepository,
    private readonly trackerAIService: TrackerAIServiceContract
  ) {}

  async execute(input: {
    trackerId: string
    subtopicId: string
    userId: string
    count?: number
  }) {
    const tracker = await this.trackerRepository.findOwnedTrackerById(
      input.trackerId,
      input.userId
    )

    if (!tracker) {
      throw new ApiError(404, 'Tracker not found', 'TRACKER_NOT_FOUND')
    }

    const lesson = await this.trackerRepository.findLessonBySubtopicId({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
    })

    if (!lesson) {
      throw new ApiError(
        404,
        'Generate the lesson before generating questions',
        'LESSON_NOT_GENERATED'
      )
    }

    const generated = await this.trackerAIService.generateLessonPracticeQuestions({
      lessonTitle: lesson.title,
      lessonSummary: lesson.summary,
      lessonExplanation: lesson.explanation,
      count: input.count,
    })

    await this.trackerRepository.createLessonGeneratedQuestions({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
      lessonId: getDocumentId(lesson),
      questions: generated.questions.map((question) => ({
        question,
        questionHash: hashQuestion(question),
        source: 'ai_generated',
      })),
    })

    return this.trackerRepository.getLessonGeneratedQuestions({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
    })
  }
}
