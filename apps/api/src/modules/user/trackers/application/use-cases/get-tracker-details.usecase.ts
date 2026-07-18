import { TrackerApplicationError } from '../tracker-application.error';
import type { ITrackerMapper } from '../tracker.mapper';
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface';
import type { TrackerRecord } from '../../domain';
import type { TrackerAccessPayloadDTO } from '../tracker.dto';

export interface IGetTrackerDetailsUseCase {
  execute(input: TrackerAccessPayloadDTO): Promise<TrackerRecord>;
}

export class GetTrackerDetailsUseCase implements IGetTrackerDetailsUseCase {
  constructor(
    private readonly _trackerRepository: Pick<ITrackerRepository, 'findOwnedTrackerById'>,
    private readonly _trackerMapper: ITrackerMapper
  ) {}

  async execute(input: TrackerAccessPayloadDTO) {
    const tracker = await this._trackerRepository.findOwnedTrackerById({
      trackerId: input.trackerId,
      userId: input.userId,
    });

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found');
    }

    return this._trackerMapper.toTrackerDto(tracker);
  }
}
