import { ApiError } from '../../../../shared/utils/ApiError'
import type { TrackerRepository } from '../../domain/repositories/tracker.repository.interface'
import type { CodeExecutionServiceContract } from '../../domain/services/code-execution.service.interface'

type RunLessonCodeInput = {
  trackerId: string
  subtopicId: string
  userId: string
  sourceCode: string
  languageId: number
  language?: string
  stdin?: string
}

export class RunLessonCodeUseCase {
  constructor(
    private readonly trackerRepository: TrackerRepository,
    private readonly codeExecutionService: CodeExecutionServiceContract
  ) {}

  async execute(input: RunLessonCodeInput) {
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
        'Generate the lesson before running code',
        'LESSON_NOT_GENERATED'
      )
    }

    return this.codeExecutionService.executeCode({
      sourceCode: input.sourceCode,
      languageId: input.languageId,
      language: input.language || lesson.codeExample?.language || 'javascript',
      stdin: input.stdin,
    })
  }
}
