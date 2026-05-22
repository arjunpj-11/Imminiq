// apps/api/src/modules/trackers/application/use-cases/submit-lesson-code.usecase.ts

import { ApiError } from '../../../../shared/utils/ApiError'
import { executeCodeWithPiston } from '../../../../infrastructure/compiler/piston.service'
import type { TrackerRepository } from '../../domain/repositories/tracker.repository.interface'

type SubmitLessonCodeInput = {
  trackerId: string
  subtopicId: string
  userId: string
  sourceCode: string
  languageId: number
  language?: string
  stdin?: string
}

const normalizeOutput = (value: string) => {
  return value.replace(/\r\n/g, '\n').trim()
}

export class SubmitLessonCodeUseCase {
  constructor(
    private readonly trackerRepository: TrackerRepository
  ) {}

  async execute(input: SubmitLessonCodeInput) {
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
      await this.trackerRepository.findGeneratedLessonBySubtopic({
        trackerId: input.trackerId,
        subtopicId: input.subtopicId,
        userId: input.userId,
      })

    const result = await executeCodeWithPiston({
      sourceCode: input.sourceCode,
      languageId: input.languageId,
      language:
        input.language ||
        lesson?.codeExample?.language ||
        'javascript',
      stdin: input.stdin,
    })

    const expectedOutput =
      lesson?.practiceTask?.expectedOutput || ''

    const actualOutput =
      result.stdout ||
      result.stderr ||
      result.compileOutput ||
      result.message ||
      ''

    const hasExecutionError =
      Boolean(result.stderr) ||
      Boolean(result.compileOutput) ||
      result.status.id !== 3

    const isCorrect = expectedOutput
      ? normalizeOutput(result.stdout) === normalizeOutput(expectedOutput)
      : !hasExecutionError

    return {
      isCorrect,
      expectedOutput,
      actualOutput,
      stdout: result.stdout,
      stderr: result.stderr,
      compileOutput: result.compileOutput,
      message: result.message,
      status: result.status,
      time: result.time,
      memory: result.memory,
      canCompareOptimized: isCorrect,
      canAskHints: !isCorrect,
    }
  }
}