import { TrackerApplicationError } from '../tracker-application.error';
import type { ITrackerMapper } from '../tracker.mapper';
import type { ITrackerCommandRepository } from '../../domain/repositories/tracker-command.repository.interface';
import type { PublishTrackerInput } from '../../domain/trackers.types';

type PublishTrackerResultDTO = ReturnType<ITrackerMapper['toTrackerDto']>;

export interface IPublishTrackerUseCase {
  execute(input: PublishTrackerInput): Promise<PublishTrackerResultDTO>;
}

export class PublishTrackerUseCase implements IPublishTrackerUseCase {
  constructor(
    private readonly _trackerRepository: Pick<ITrackerCommandRepository, 'publishOwnedTracker'>,
    private readonly _trackerMapper: ITrackerMapper
  ) {}

  async execute(input: PublishTrackerInput): Promise<PublishTrackerResultDTO> {
    const tracker = await this._trackerRepository.publishOwnedTracker(input);

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found');
    }

    return this._trackerMapper.toTrackerDto(tracker);
  }
}
