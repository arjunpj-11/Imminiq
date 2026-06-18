import type { DashboardTrackerRepositoryContract } from '../../domain/repositories/dashboard-tracker.repository.interface'
import type { DashboardActiveTracker } from '../dtos/dashboard.dto'
import type { DashboardMapperContract } from '../mappers/dashboard.mapper'

export class GetCurrentRoadmapUseCase {
  constructor(
    private readonly dashboardRepository: DashboardTrackerRepositoryContract,
    private readonly dashboardMapper: DashboardMapperContract
  ) {}

  async execute(userId: string): Promise<DashboardActiveTracker | null> {
    const trackerSummary = await this.dashboardRepository.getTrackerOverview(userId)
    const currentTracker = trackerSummary.activeTrackers[0]

    return currentTracker
      ? this.dashboardMapper.toActiveTracker(currentTracker)
      : null
  }
}
