import type { IDashboardTrackerRepository } from '../../domain/repositories/dashboard-tracker.repository.interface';
import type { IDashboardActiveTrackerDTO } from '../dashboard.dto';
import type { IDashboardMapper } from '../dashboard.mapper';

export interface IGetCurrentRoadmapUseCase {
  execute(userId: string): Promise<IDashboardActiveTrackerDTO | null>;
}

export class GetCurrentRoadmapUseCase implements IGetCurrentRoadmapUseCase {
  constructor(
    private readonly _dashboardRepository: IDashboardTrackerRepository,
    private readonly _dashboardMapper: IDashboardMapper
  ) {}

  async execute(userId: string): Promise<IDashboardActiveTrackerDTO | null> {
    const trackerSummary = await this._dashboardRepository.getTrackerOverview(userId);
    const currentTracker = trackerSummary.activeTrackers[0];

    return currentTracker ? this._dashboardMapper.toActiveTracker(currentTracker) : null;
  }
}
