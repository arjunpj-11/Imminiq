// apps/api/src/modules/trackers/application/use-cases/run-lesson-code.usecase.ts

import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerMapperContract } from '../mappers/tracker.mapper'
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

type RunLessonCodeResultDto = ReturnType<
  TrackerMapperContract['toLessonCodeExecutionDto']
>

export class RunLessonCodeUseCase {
  constructor(
    private readonly _trackerRepository: TrackerRepositoryContract,
    private readonly _codeExecutionService: CodeExecutionServiceContract,
    private readonly _trackerMapper: TrackerMapperContract,
  ) {}

  async execute(input: RunLessonCodeInput): Promise<RunLessonCodeResultDto> {
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
        'Generate the lesson before running code',
      )
    }

    const result = await this._codeExecutionService.executeCode({
      sourceCode: input.sourceCode,
      languageId: input.languageId,
      language: input.language || lesson.codeExample?.language || 'javascript',
      stdin: input.stdin,
    })

    return this._trackerMapper.toLessonCodeExecutionDto(result)
  }
}