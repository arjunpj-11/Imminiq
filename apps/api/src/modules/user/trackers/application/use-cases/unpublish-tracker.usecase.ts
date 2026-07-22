import type {
  TrackerDTO,
} from '../tracker.dto';
import { TrackerApplicationError } from '../tracker-application.error';
import type { ITrackerMapper } from '../tracker.mapper';
import type {
  ITrackerCommandRepository,
  UnpublishOwnedTrackerInput,
} from '../../domain/repositories/tracker-command.repository.interface';

export interface IUnpublishTrackerUseCase {
  execute(input: UnpublishOwnedTrackerInput): Promise<TrackerDTO>;
}

export class UnpublishTrackerUseCase implements IUnpublishTrackerUseCase {
  constructor(
    private readonly _trackerRepository: Pick<ITrackerCommandRepository, 'unpublishOwnedTracker'>,
    private readonly _trackerMapper: ITrackerMapper
  ) {}

  async execute(input: UnpublishOwnedTrackerInput): Promise<TrackerDTO> {
    const tracker = await this._trackerRepository.unpublishOwnedTracker(input);

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found');
    }

    return this._trackerMapper.toTrackerDto(tracker);
  }
}
