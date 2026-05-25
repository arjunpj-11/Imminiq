// apps/api/src/modules/trackers/application/use-cases/run-lesson-code.usecase.ts

import { ApiError } from '../../../../shared/utils/ApiError'
import { executeCodeWithPiston } from '../../../../infrastructure/compiler/piston.service'
import type { TrackerRepository } from '../../domain/repositories/tracker.repository.interface'

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
    private readonly trackerRepository: TrackerRepository
  ) {}

  async execute(input: RunLessonCodeInput) {
    const tracker =
      await this.trackerRepository.findOwnedTrackerById(
        input.trackerId,
        input.userId
      )

    if (!tracker) {
      throw new ApiError(
        404,
        'Tracker not found',
        'TRACKER_NOT_FOUND'
      )
    }

    const lesson =
      await this.trackerRepository.findLessonBySubtopicId({
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

    const language = input.language || 'javascript'

    const result = await executeCodeWithPiston({
      sourceCode: input.sourceCode,
      languageId: input.languageId,
      language,
      stdin: input.stdin,
    })

    const lessonId =
      typeof lesson._id === 'string'
        ? lesson._id
        : lesson._id?.toString?.() ?? null

    await this.trackerRepository.createLessonCodeSubmission({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
      lessonId,
      action: 'run',
      language,
      languageId: input.languageId,
      sourceCode: input.sourceCode,
      stdin: input.stdin ?? '',
      stdout: result.stdout ?? '',
      stderr: result.stderr ?? '',
      compileOutput: result.compileOutput ?? '',
      message: result.message ?? '',
      status: result.status ?? null,
      time: result.time ?? null,
      memory: result.memory ?? null,
      isCorrect: false,
      expectedOutput: '',
      actualOutput: result.stdout ?? '',
      feedback: '',
    })

    return result
  }
}