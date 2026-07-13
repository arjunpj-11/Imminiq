// apps/api/src/modules/user/trackers/application/use-cases/clear-lesson-question-solution-doubts.usecase.ts

import { TrackerApplicationError } from '../tracker-application.error';
import type { ITrackerMapper } from '../tracker.mapper';
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface';
import type { IQuestionHasher } from '../../domain/services/question-hasher.interface';

type ClearLessonQuestionSolutionDoubtsResultDTO = ReturnType<
  ITrackerMapper['toClearLessonHistoryResultDto']
>;

export interface IClearLessonQuestionSolutionDoubtsUseCase {
  execute(input: {
    trackerId: string;
    subtopicId: string;
    userId: string;
    question: string;
  }): Promise<ClearLessonQuestionSolutionDoubtsResultDTO>;
}

export class ClearLessonQuestionSolutionDoubtsUseCase implements IClearLessonQuestionSolutionDoubtsUseCase {
  constructor(
    private readonly _trackerRepository: Pick<
      ITrackerRepository,
      'clearLessonQuestionSolutionDoubts' | 'findOwnedTrackerById'
    >,
    private readonly _questionHasher: IQuestionHasher,
    private readonly _trackerMapper: ITrackerMapper
  ) {}

  async execute(input: {
    trackerId: string;
    subtopicId: string;
    userId: string;
    question: string;
  }): Promise<ClearLessonQuestionSolutionDoubtsResultDTO> {
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
