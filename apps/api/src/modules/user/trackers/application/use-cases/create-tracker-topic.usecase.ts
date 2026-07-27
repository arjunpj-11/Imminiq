import type { TrackerTopicDTO } from '../tracker.dto';
import { TrackerApplicationError } from '../tracker-application.error';
import type { ITrackerMapper } from '../tracker.mapper';
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface';
import type { CreateTopicUseCaseInput } from '../../domain/trackers.types';
import { formatNumberedTopicTitle } from '../missing-topic-placement.policy';

export interface ICreateTrackerTopicUseCase {
  execute(input: CreateTopicUseCaseInput): Promise<TrackerTopicDTO>;
}

export class CreateTrackerTopicUseCase implements ICreateTrackerTopicUseCase {
  constructor(
    private readonly _trackerRepository: Pick<
      ITrackerRepository,
      | 'createTrackerTopic'
      | 'findLastTopicForTracker'
      | 'findOwnedTrackerById'
      | 'incrementTrackerTopicsCount'
    >,
    private readonly _trackerMapper: ITrackerMapper
  ) {}

  async execute(input: CreateTopicUseCaseInput): Promise<TrackerTopicDTO> {
    const tracker = await this._trackerRepository.findOwnedTrackerById({
      trackerId: input.trackerId,
      userId: input.userId,
    });

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found');
    }

    const lastTopic = await this._trackerRepository.findLastTopicForTracker(input.trackerId);
    const nextOrder = (lastTopic?.order || 0) + 1;

    const hasNumberedLastTopic = Boolean(
      lastTopic?.title && /^(?:topic\s+)?\d+[\s._:-]*/i.test(lastTopic.title.trim())
    );
    const inputHasNumber = /^(?:topic\s+)?\d+[\s._:-]*/i.test(input.title.trim());
    const shouldNumber = hasNumberedLastTopic || inputHasNumber;

    const formattedTitle = formatNumberedTopicTitle(input.title, nextOrder, shouldNumber);

    const topic = await this._trackerRepository.createTrackerTopic({
      trackerId: input.trackerId,
      title: formattedTitle,
      description: input.description || '',
      order: nextOrder,
    });

    await this._trackerRepository.incrementTrackerTopicsCount(input.trackerId);

    return this._trackerMapper.toTrackerTopicDto(topic);
  }
}
