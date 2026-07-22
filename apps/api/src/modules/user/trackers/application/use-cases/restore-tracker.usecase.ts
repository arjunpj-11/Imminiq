import type {
  TrackerDTO,
} from '../tracker.dto';
import { TrackerApplicationError } from '../tracker-application.error';
import type { ITrackerMapper } from '../tracker.mapper';
import type {
  ITrackerCommandRepository,
  RestoreOwnedTrackerInput,
} from '../../domain/repositories/tracker-command.repository.interface';

export interface IRestoreTrackerUseCase {
  execute(input: RestoreOwnedTrackerInput): Promise<TrackerDTO>;
}

export class RestoreTrackerUseCase implements IRestoreTrackerUseCase {
  constructor(
    private readonly _trackerRepository: Pick<ITrackerCommandRepository, 'restoreOwnedTracker'>,
    private readonly _trackerMapper: ITrackerMapper
  ) {}

  async execute(input: RestoreOwnedTrackerInput): Promise<TrackerDTO> {
    const tracker = await this._trackerRepository.restoreOwnedTracker(input);

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found');
    }

    return this._trackerMapper.toTrackerDto(tracker);
  }
}
