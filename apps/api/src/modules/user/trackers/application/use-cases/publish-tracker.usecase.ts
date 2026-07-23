import type { TrackerDTO } from '../tracker.dto';
import { TrackerApplicationError } from '../tracker-application.error';
import type { ITrackerMapper } from '../tracker.mapper';
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface';
import type { PublishTrackerInput } from '../../domain/trackers.types';

export interface IPublishTrackerUseCase {
  execute(input: PublishTrackerInput): Promise<TrackerDTO>;
}

export class PublishTrackerUseCase implements IPublishTrackerUseCase {
  constructor(
    private readonly _trackerRepository: Pick<
      ITrackerRepository,
      'findOwnedTrackerById' | 'publishOwnedTracker'
    >,
    private readonly _trackerMapper: ITrackerMapper
  ) {}

  async execute(input: PublishTrackerInput): Promise<TrackerDTO> {
    const ownedTracker = await this._trackerRepository.findOwnedTrackerById({
      trackerId: input.trackerId,
      userId: input.userId,
    });

    if (!ownedTracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found');
    }

    if (ownedTracker.sourceTrackerId) {
      throw TrackerApplicationError.clonedTrackerCannotBePublished();
    }

    const tracker = await this._trackerRepository.publishOwnedTracker(input);

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found');
    }

    return this._trackerMapper.toTrackerDto(tracker);
  }
}
