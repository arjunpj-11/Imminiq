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

const getLessonId = (lesson: unknown) => {
  const lessonWithId = lesson as { _id?: unknown }

  if (typeof lessonWithId._id === 'string') {
    return lessonWithId._id
  }

  if (
    lessonWithId._id &&
    typeof lessonWithId._id === 'object' &&
    'toString' in lessonWithId._id
  ) {
    return lessonWithId._id.toString()
  }

  return null
}

export class SubmitLessonCodeUseCase {
  constructor(private readonly trackerRepository: TrackerRepository) {}

  async execute(input: SubmitLessonCodeInput) {
    const tracker = await this.trackerRepository.findOwnedTrackerById(
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

    const lesson = await this.trackerRepository.findLessonBySubtopicId({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
    })

    if (!lesson) {
      throw new ApiError(
        404,
        'Generate the lesson before submitting code',
        'LESSON_NOT_GENERATED'
      )
    }

    const language =
      input.language || lesson.codeExample?.language || 'javascript'

    const result = await executeCodeWithPiston({
      sourceCode: input.sourceCode,
      languageId: input.languageId,
      language,
      stdin: input.stdin,
    })

  const practiceTask = lesson.practiceTask as {
  expectedOutput?: string
} | undefined

const expectedOutput = practiceTask?.expectedOutput || ''

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

    const feedback = isCorrect
      ? 'Great job! Your code produced the expected output.'
      : hasExecutionError
        ? 'Your code has an execution or compilation error. Check the output and try again.'
        : expectedOutput
          ? 'Your code ran successfully, but the output does not match the expected output.'
          : 'Your code ran, but it could not be marked as correct.'

    const response = {
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
      feedback,
      canCompareOptimized: isCorrect,
      canAskHints: !isCorrect,
    }

    await this.trackerRepository.createLessonCodeSubmission({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
      lessonId: getLessonId(lesson),
      action: 'submit',
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
      isCorrect,
      expectedOutput,
      actualOutput,
      feedback,
    })

    return response
  }
}