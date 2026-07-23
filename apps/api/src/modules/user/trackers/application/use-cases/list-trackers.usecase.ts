import type { TrackerListDTO } from '../tracker.dto';
import type { ITrackerMapper } from '../tracker.mapper';
import type { ITrackerQueryRepository } from '../../domain/repositories/tracker-query.repository.interface';
import type { TrackerListFilter } from '../../domain/trackers.types';

export interface IListTrackersUseCase {
  execute(filter: TrackerListFilter): Promise<TrackerListDTO>;
}

export class ListTrackersUseCase implements IListTrackersUseCase {
  constructor(
    private readonly _trackerRepository: Pick<ITrackerQueryRepository, 'listOwnedTrackers'>,
    private readonly _trackerMapper: ITrackerMapper
  ) {}

  async execute(filter: TrackerListFilter): Promise<TrackerListDTO> {
    const trackers = await this._trackerRepository.listOwnedTrackers(filter);
    return this._trackerMapper.toTrackerListDto(trackers);
  }
}
