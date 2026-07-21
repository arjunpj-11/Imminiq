// apps/api/src/modules/user/trackers/application/use-cases/clear-lesson-chat-history.usecase.ts

import { TrackerApplicationError } from '../tracker-application.error';
import type { ITrackerMapper } from '../tracker.mapper';
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface';
import type {
  ClearLessonHistoryResultDTO,
  TrackerLessonAccessPayloadDTO,
} from '../tracker.dto';

export interface IClearLessonChatHistoryUseCase {
  execute(input: TrackerLessonAccessPayloadDTO): Promise<ClearLessonHistoryResultDTO>;
}

export class ClearLessonChatHistoryUseCase implements IClearLessonChatHistoryUseCase {
  constructor(
    private readonly _trackerRepository: Pick<
      ITrackerRepository,
      'clearLessonChatMessages' | 'findOwnedTrackerById'
    >,
    private readonly _trackerMapper: ITrackerMapper
  ) {}

  async execute(input: TrackerLessonAccessPayloadDTO): Promise<ClearLessonHistoryResultDTO> {
    const tracker = await this._trackerRepository.findOwnedTrackerById({
      trackerId: input.trackerId,
      userId: input.userId,
    });

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found');
    }

    const result = await this._trackerRepository.clearLessonChatMessages(input);

    return this._trackerMapper.toClearLessonHistoryResultDto(result);
  }
}
