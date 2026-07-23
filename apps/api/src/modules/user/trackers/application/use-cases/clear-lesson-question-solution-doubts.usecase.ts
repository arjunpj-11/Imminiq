// apps/api/src/modules/user/trackers/application/use-cases/clear-lesson-question-solution-doubts.usecase.ts

import { TrackerApplicationError } from '../tracker-application.error';
import type { ITrackerMapper } from '../tracker.mapper';
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface';
import type { IQuestionHasher } from '../../domain/services/question-hasher.interface';
import type { ClearLessonHistoryResultDTO, LessonQuestionPayloadDTO } from '../tracker.dto';

export interface IClearLessonQuestionSolutionDoubtsUseCase {
  execute(input: LessonQuestionPayloadDTO): Promise<ClearLessonHistoryResultDTO>;
}

export class ClearLessonQuestionSolutionDoubtsUseCase
  implements IClearLessonQuestionSolutionDoubtsUseCase
{
  constructor(
    private readonly _trackerRepository: Pick<
      ITrackerRepository,
      'clearLessonQuestionSolutionDoubts' | 'findOwnedTrackerById'
    >,
    private readonly _questionHasher: IQuestionHasher,
    private readonly _trackerMapper: ITrackerMapper
  ) {}

  async execute(input: LessonQuestionPayloadDTO): Promise<ClearLessonHistoryResultDTO> {
    const tracker = await this._trackerRepository.findOwnedTrackerById({
      trackerId: input.trackerId,
      userId: input.userId,
    });

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found');
    }

    const result = await this._trackerRepository.clearLessonQuestionSolutionDoubts({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
      questionHash: this._questionHasher.hash(input.question),
    });

    return this._trackerMapper.toClearLessonHistoryResultDto(result);
  }
}
