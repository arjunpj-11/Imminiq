import type { ITrackerMapper } from '../tracker.mapper';
import type { ITrackerQueryRepository } from '../../domain/repositories/tracker-query.repository.interface';

type TrackerSummaryResultDTO = ReturnType<ITrackerMapper['toTrackerSummaryDto']>;

export interface IGetTrackerSummaryUseCase {
  execute(userId: string): Promise<TrackerSummaryResultDTO>;
}

export class GetTrackerSummaryUseCase implements IGetTrackerSummaryUseCase {
  constructor(
    private readonly _trackerRepository: Pick<ITrackerQueryRepository, 'getTrackerSummary'>,
    private readonly _trackerMapper: ITrackerMapper
  ) {}

  async execute(userId: string): Promise<TrackerSummaryResultDTO> {
    const summary = await this._trackerRepository.getTrackerSummary(userId);
    return this._trackerMapper.toTrackerSummaryDto(summary);
  }
}
