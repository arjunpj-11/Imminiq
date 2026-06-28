import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerMapperContract } from '../mappers/tracker.mapper'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'
import type { CodeExecutionServiceContract } from '../../domain/services/code-execution.service.interface'

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

type SubmitLessonCodeInput = {
  trackerId: string
  subtopicId: string
  userId: string
  sourceCode: string
  languageId: number
  language?: string
  stdin?: string
}

type SubmitLessonCodeResultDto = ReturnType<
  TrackerMapperContract['toLessonCodeExecutionDto']
>

const normalizeOutput = (value: string) => {
  return value.replace(/\r\n/g, '\n').trim()
}

export class SubmitLessonCodeUseCase {
  constructor(
    private readonly _trackerRepository: TrackerRepositoryContract,
    private readonly _codeExecutionService: CodeExecutionServiceContract,
    private readonly _trackerMapper: TrackerMapperContract,
  ) {}

  async execute(
    input: SubmitLessonCodeInput,
  ): Promise<SubmitLessonCodeResultDto> {
    const tracker = await this._trackerRepository.findOwnedTrackerById({
      trackerId: input.trackerId,
      userId: input.userId,
    })

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    const lesson = await this._trackerRepository.findLessonBySubtopicId({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
    })

    if (!lesson) {
      throw TrackerApplicationError.lessonNotGenerated(
        'Generate the lesson before submitting code',
      )
    }

    const language =
      input.language || lesson.codeExample?.language || 'javascript'

    const result = await this._codeExecutionService.executeCode({
      sourceCode: input.sourceCode,
      languageId: input.languageId,
      language,
      stdin: input.stdin,
    })

    const practiceTask = lesson.practiceTask as
      | {
          expectedOutput?: string
        }
      | undefined

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

    await this._trackerRepository.createLessonCodeSubmission({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
      lessonId: getDocumentId(lesson),
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

    return this._trackerMapper.toLessonCodeExecutionDto(response)
  }
}