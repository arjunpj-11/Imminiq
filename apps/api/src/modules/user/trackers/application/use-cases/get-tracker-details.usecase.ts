import { TrackerApplicationError } from '../tracker-application.error';
import type { ITrackerMapper } from '../tracker.mapper';
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface';

export interface IGetTrackerDetailsUseCase {
  execute(input: {
    trackerId: string;
    userId: string;
  }): Promise<import('../../domain').TrackerRecord>;
}

export class GetTrackerDetailsUseCase implements IGetTrackerDetailsUseCase {
  constructor(
    private readonly _trackerRepository: Pick<ITrackerRepository, 'findOwnedTrackerById'>,
    private readonly _trackerMapper: ITrackerMapper
  ) {}

  async execute(input: { trackerId: string; userId: string }) {
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
