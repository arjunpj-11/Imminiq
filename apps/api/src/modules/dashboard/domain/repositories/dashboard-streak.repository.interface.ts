import type { DashboardActivityIntensityEntity } from '../entities/dashboard-activity-intensity.entity'
import type { DashboardStreakEntity } from '../entities/dashboard-streak.entity'

export interface DashboardStreakRepositoryContract {
  getStreakData(userId: string): Promise<DashboardStreakEntity>

  getActivityIntensity(
    userId: string,
    months?: number
  ): Promise<DashboardActivityIntensityEntity[]>
}
