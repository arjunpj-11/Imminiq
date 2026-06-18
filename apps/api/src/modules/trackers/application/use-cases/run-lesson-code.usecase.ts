import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'
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
    private readonly trackerRepository: TrackerRepositoryContract,
    private readonly codeExecutionService: CodeExecutionServiceContract
  ) {}

  async execute(input: RunLessonCodeInput) {
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
      throw TrackerApplicationError.lessonNotGenerated('Generate the lesson before running code')
    }

    return this.codeExecutionService.executeCode({
      sourceCode: input.sourceCode,
      languageId: input.languageId,
      language: input.language || lesson.codeExample?.language || 'javascript',
      stdin: input.stdin,
    })
  }
}
