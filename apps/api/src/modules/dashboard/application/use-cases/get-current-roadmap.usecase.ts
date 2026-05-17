import type { DashboardRepository } from '../../domain/repositories/dashboard.repository.interface'
import type { DashboardActiveTracker } from '../../domain/types/dashboard.types'

export class GetCurrentRoadmapUseCase {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async execute(userId: string): Promise<DashboardActiveTracker | null> {
    const trackers =
      await this.dashboardRepository.getTrackerOverview(userId)

    if (trackers.activeTrackers.length === 0) {
      return null
    }

    return trackers.activeTrackers[0]
  }
}
