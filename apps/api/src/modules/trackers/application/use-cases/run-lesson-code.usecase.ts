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

    return executeCodeWithPiston({
      sourceCode: input.sourceCode,
      languageId: input.languageId,
      language: input.language || 'javascript',
      stdin: input.stdin,
    })
  }
}