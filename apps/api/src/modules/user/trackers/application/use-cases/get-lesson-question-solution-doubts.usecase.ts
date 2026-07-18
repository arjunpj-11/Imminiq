import { TrackerApplicationError } from '../tracker-application.error';
import type {
  LessonQuestionPayloadDTO,
  LessonQuestionSolutionDoubtsDTO,
} from '../tracker.dto';
import type { ITrackerMapper } from '../tracker.mapper';
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface';
import type { IQuestionHasher } from '../../domain/services/question-hasher.interface';

export interface IGetLessonQuestionSolutionDoubtsUseCase {
  execute(input: LessonQuestionPayloadDTO): Promise<LessonQuestionSolutionDoubtsDTO>;
}

export class GetLessonQuestionSolutionDoubtsUseCase implements IGetLessonQuestionSolutionDoubtsUseCase {
  constructor(
    private readonly _trackerRepository: Pick<
      ITrackerRepository,
      'findOwnedTrackerById' | 'getLessonQuestionSolutionDoubts'
    >,
    private readonly _questionHasher: IQuestionHasher,
    private readonly _trackerMapper: ITrackerMapper
  ) {}

  async execute(input: LessonQuestionPayloadDTO) {
    const tracker = await this._trackerRepository.findOwnedTrackerById({
      trackerId: input.trackerId,
      userId: input.userId,
    });

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found');
    }

    const doubts = await this._trackerRepository.getLessonQuestionSolutionDoubts({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
      questionHash: this._questionHasher.hash(input.question),
    });

    return this._trackerMapper.toLessonQuestionSolutionDoubtsDto(doubts);
  }
}
