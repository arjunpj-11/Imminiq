import { ApiError } from '../../../../shared/utils/ApiError'
import type { DashboardRepository } from '../../domain/repositories/dashboard.repository.interface'
import type { DashboardSummary } from '../../domain/types/dashboard.types'

export class GetDashboardSummaryUseCase {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async execute(userId: string): Promise<DashboardSummary> {
    const [
      { user, profile },
      streak,
      trackers,
      stats,
      recentActivity,
      unreadNotificationCount,
    ] = await Promise.all([
      this.dashboardRepository.getUserWithProfile(userId),
      this.dashboardRepository.getStreakData(userId),
      this.dashboardRepository.getTrackerOverview(userId),
      this.dashboardRepository.getAggregatedStats(userId),
      this.dashboardRepository.getRecentActivity(userId, 5),
      this.dashboardRepository.getUnreadNotificationCount(userId),
    ])

    if (!user) {
      throw new ApiError(404, 'User not found', 'NOT_FOUND')
    }

    return {
      user: {
        _id: user._id.toString(),
        fullName: user.fullName,
        username: user.username,
        avatarUrl: profile?.avatarUrl || '',
        isPremium: user.isPremium,
        coinBalance: user.coins || 0,
      },
      streak,
      trackers,
      stats,
      recentActivity,
      notifications: {
        unreadCount: unreadNotificationCount,
        hasUnread: unreadNotificationCount > 0,
      },
      isPremium: user.isPremium,
    }
  }
}
