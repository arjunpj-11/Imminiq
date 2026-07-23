import type { TrackerSummaryDTO } from '../tracker.dto';
import type { ITrackerMapper } from '../tracker.mapper';
import type { ITrackerQueryRepository } from '../../domain/repositories/tracker-query.repository.interface';

export interface IGetTrackerSummaryUseCase {
  execute(userId: string): Promise<TrackerSummaryDTO>;
}

export class GetTrackerSummaryUseCase implements IGetTrackerSummaryUseCase {
  constructor(
    private readonly _trackerRepository: Pick<ITrackerQueryRepository, 'getTrackerSummary'>,
    private readonly _trackerMapper: ITrackerMapper
  ) {}

  async execute(userId: string): Promise<TrackerSummaryDTO> {
    const summary = await this._trackerRepository.getTrackerSummary(userId);
    return this._trackerMapper.toTrackerSummaryDto(summary);
  }
}
