import { TrackerApplicationError } from '../tracker-application.error';
import type { ITrackerMapper } from '../tracker.mapper';
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface';
import type { TrackerAccessPayloadDTO, TrackerDTO } from '../tracker.dto';

export interface IArchiveTrackerUseCase {
  execute(input: TrackerAccessPayloadDTO): Promise<TrackerDTO>;
}

export class ArchiveTrackerUseCase implements IArchiveTrackerUseCase {
  constructor(
    private readonly _trackerRepository: Pick<ITrackerRepository, 'archiveOwnedTracker'>,
    private readonly _trackerMapper: ITrackerMapper
  ) {}

  async execute(input: TrackerAccessPayloadDTO): Promise<TrackerDTO> {
    const tracker = await this._trackerRepository.archiveOwnedTracker(input);

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found');
    }

    return this._trackerMapper.toTrackerDto(tracker);
  }
}
