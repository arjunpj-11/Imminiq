import { ApiError } from '../../../../shared/utils/ApiError'
import type { TrackerRepository } from '../../domain/repositories/tracker.repository.interface'
import { generateLessonVisualization } from '../../../../infrastructure/ai/ai.service'
 
export class GenerateLessonVisualizationUseCase {
  constructor(
    private readonly trackerRepository: TrackerRepository
  ) {}
 
  async execute(input: {
    trackerId: string
    subtopicId: string
    userId: string
    regenerate?: boolean    // true → skip cache and overwrite
  }) {
    const tracker =
      await this.trackerRepository.findOwnedTrackerById(
        input.trackerId,
        input.userId
      )
 
    if (!tracker) {
      throw new ApiError(404, 'Tracker not found', 'TRACKER_NOT_FOUND')
    }
 
    // ── 1. Return cached visualization if it exists and regenerate not requested ──
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
 
    // ── 2. Fetch the lesson to build the AI prompt ─────────────────────────────
    const lesson =
      await this.trackerRepository.findLessonBySubtopicId({
        trackerId: input.trackerId,
        subtopicId: input.subtopicId,
        userId: input.userId,
      })
 
    if (!lesson) {
      throw new ApiError(
        404,
        'Generate the lesson before visualizing',
        'LESSON_NOT_GENERATED'
      )
    }
 
    // ── 3. Generate via AI ─────────────────────────────────────────────────────
    const result = await generateLessonVisualization({
      title: lesson.title,
      summary: lesson.summary,
      explanation: lesson.explanation,
      lessonType: lesson.lessonType,
      tags: lesson.tags ?? [],
      difficulty: lesson.difficulty,
      codeExample: lesson.codeExample,
    })
 
    // ── 4. Persist to DB (upsert — safe to call on both first-time and regenerate) ──
    await this.trackerRepository.saveLessonVisualization({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
      lessonId: lesson._id?.toString?.() ?? null,
      html: result.html,
      visualTitle: result.visualTitle,
      visualDescription: result.visualDescription,
    })
 
    return result
  }
}
 