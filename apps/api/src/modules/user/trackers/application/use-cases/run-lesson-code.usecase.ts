// apps/api/src/modules/user/trackers/application/use-cases/run-lesson-code.usecase.ts

import { TrackerApplicationError } from '../tracker-application.error';
import type { ITrackerMapper } from '../tracker.mapper';
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface';
import type { ICodeExecutor } from '../../domain/services/code-execution.interface';

type RunLessonCodeInput = {
  trackerId: string;
  subtopicId: string;
  userId: string;
  sourceCode: string;
  languageId: number;
  language?: string;
  stdin?: string;
};

type RunLessonCodeResultDTO = ReturnType<ITrackerMapper['toLessonCodeExecutionDto']>;

export interface IRunLessonCodeUseCase {
  execute(input: RunLessonCodeInput): Promise<RunLessonCodeResultDTO>;
}

export class RunLessonCodeUseCase implements IRunLessonCodeUseCase {
  constructor(
    private readonly _trackerRepository: Pick<
      ITrackerRepository,
      'findLessonBySubtopicId' | 'findOwnedTrackerById'
    >,
    private readonly _codeExecutor: ICodeExecutor,
    private readonly _trackerMapper: ITrackerMapper
  ) {}

  async execute(input: RunLessonCodeInput): Promise<RunLessonCodeResultDTO> {
    const tracker = await this._trackerRepository.findOwnedTrackerById({
      trackerId: input.trackerId,
      userId: input.userId,
    });

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found');
    }

    const lesson = await this._trackerRepository.findLessonBySubtopicId({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
    });

    if (!lesson) {
      throw TrackerApplicationError.lessonNotGenerated('Generate the lesson before running code');
    }

    const result = await this._codeExecutor.executeCode({
      sourceCode: input.sourceCode,
      languageId: input.languageId,
      language: input.language || lesson.codeExample?.language || 'javascript',
      stdin: input.stdin,
    });

    return this._trackerMapper.toLessonCodeExecutionDto(result);
  }
}
