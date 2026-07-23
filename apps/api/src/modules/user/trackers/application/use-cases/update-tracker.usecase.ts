import type { TrackerDTO } from '../tracker.dto';
import { TrackerApplicationError } from '../tracker-application.error';
import type { ITrackerMapper } from '../tracker.mapper';
import type { ITrackerCommandRepository } from '../../domain/repositories/tracker-command.repository.interface';
import type { UpdateTrackerInput } from '../../domain/trackers.types';

export interface IUpdateTrackerUseCase {
  execute(input: UpdateTrackerInput): Promise<TrackerDTO>;
}

export class UpdateTrackerUseCase implements IUpdateTrackerUseCase {
  constructor(
    private readonly _trackerRepository: Pick<ITrackerCommandRepository, 'updateOwnedTracker'>,
    private readonly _trackerMapper: ITrackerMapper
  ) {}

  async execute(input: UpdateTrackerInput): Promise<TrackerDTO> {
    const tracker = await this._trackerRepository.updateOwnedTracker(input);

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found');
    }

    return this._trackerMapper.toTrackerDto(tracker);
  }
}
