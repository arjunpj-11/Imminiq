import { TrackerApplicationError } from '../tracker-application.error';
import type { ITrackerMapper } from '../tracker.mapper';
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface';
import type { TrackerLessonAccessPayloadDTO } from '../tracker.dto';

export interface IGetLessonGeneratedQuestionsUseCase {
  execute(
    input: TrackerLessonAccessPayloadDTO
  ): Promise<ReturnType<ITrackerMapper['toLessonGeneratedQuestionsDto']>>;
}

export class GetLessonGeneratedQuestionsUseCase implements IGetLessonGeneratedQuestionsUseCase {
  constructor(
    private readonly _trackerRepository: Pick<
      ITrackerRepository,
      'findOwnedTrackerById' | 'getLessonGeneratedQuestions'
    >,
    private readonly _trackerMapper: ITrackerMapper
  ) {}

  async execute(input: TrackerLessonAccessPayloadDTO) {
    const tracker = await this._trackerRepository.findOwnedTrackerById({
      trackerId: input.trackerId,
      userId: input.userId,
    });

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found');
    }

    const generatedQuestions = await this._trackerRepository.getLessonGeneratedQuestions(input);

    return this._trackerMapper.toLessonGeneratedQuestionsDto(generatedQuestions);
  }
}
