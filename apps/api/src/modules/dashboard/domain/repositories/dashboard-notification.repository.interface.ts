import type { DashboardRecentActivityEntity } from '../entities/dashboard-recent-activity.entity'

export interface DashboardNotificationRepositoryContract {
  getRecentActivity(
    userId: string,
    limit?: number
  ): Promise<DashboardRecentActivityEntity[]>

  getUnreadNotificationCount(userId: string): Promise<number>
}
