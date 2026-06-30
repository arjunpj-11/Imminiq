import type { DashboardTrackerRepositoryContract } from '../../domain/repositories/dashboard-tracker.repository.interface'
import type { DashboardActiveTracker } from '../dtos/dashboard.dto'
import type { DashboardMapperContract } from '../mappers/dashboard.mapper'

export class GetCurrentRoadmapUseCase {
  constructor(
    private readonly _dashboardRepository: DashboardTrackerRepositoryContract,
    private readonly _dashboardMapper: DashboardMapperContract
  ) {}

  async execute(userId: string): Promise<DashboardActiveTracker | null> {
    const trackerSummary = await this._dashboardRepository.getTrackerOverview(userId)
    const currentTracker = trackerSummary.activeTrackers[0]

    return currentTracker
      ? this._dashboardMapper.toActiveTracker(currentTracker)
      : null
  }
}
