import type { ITrackerMapper } from '../tracker.mapper';
import type { ITrackerQueryRepository } from '../../domain/repositories/tracker-query.repository.interface';
import type { TrackerListFilter } from '../../domain/trackers.types';

type ListTrackersResultDTO = ReturnType<ITrackerMapper['toTrackerListDto']>;

export interface IListTrackersUseCase {
  execute(filter: TrackerListFilter): Promise<ListTrackersResultDTO>;
}

export class ListTrackersUseCase implements IListTrackersUseCase {
  constructor(
    private readonly _trackerRepository: Pick<ITrackerQueryRepository, 'listOwnedTrackers'>,
    private readonly _trackerMapper: ITrackerMapper
  ) {}

  async execute(filter: TrackerListFilter): Promise<ListTrackersResultDTO> {
    const trackers = await this._trackerRepository.listOwnedTrackers(filter);
    return this._trackerMapper.toTrackerListDto(trackers);
  }
}
