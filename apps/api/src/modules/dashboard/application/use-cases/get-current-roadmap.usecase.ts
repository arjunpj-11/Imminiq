import type { IDashboardTrackerRepository } from '../../domain/repositories/dashboard-tracker.repository.interface'
import type { IDashboardActiveTrackerDTO } from '../dtos/dashboard.dto'
import type { IDashboardMapper } from '../mappers/dashboard.mapper'

export class GetCurrentRoadmapUseCase {
  constructor(
    private readonly _dashboardRepository: IDashboardTrackerRepository,
    private readonly _dashboardMapper: IDashboardMapper
  ) {}

  async execute(userId: string): Promise<IDashboardActiveTrackerDTO | null> {
    const trackerSummary = await this._dashboardRepository.getTrackerOverview(userId)
    const currentTracker = trackerSummary.activeTrackers[0]

    return currentTracker
      ? this._dashboardMapper.toActiveTracker(currentTracker)
      : null
  }
}
