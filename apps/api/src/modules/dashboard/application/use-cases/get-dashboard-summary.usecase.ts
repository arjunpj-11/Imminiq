import type { IDashboardNotificationRepository } from '../../domain/repositories/dashboard-notification.repository.interface'
import type { IDashboardProfileRepository } from '../../domain/repositories/dashboard-profile.repository.interface'
import type { IDashboardStreakRepository } from '../../domain/repositories/dashboard-streak.repository.interface'
import type { IDashboardTrackerRepository } from '../../domain/repositories/dashboard-tracker.repository.interface'
import type { IDashboardUserRepository } from '../../domain/repositories/dashboard-user.repository.interface'
import { DASHBOARD_DEFAULT_RECENT_ACTIVITY_LIMIT } from '../dashboard.constants'
import type { IDashboardSummaryDTO } from '../dashboard.dto'
import { DashboardApplicationError } from '../dashboard-application.error'
import type { IDashboardMapper } from '../dashboard.mapper'

type DashboardSummaryRepository =
  IDashboardUserRepository &
  IDashboardProfileRepository &
  IDashboardStreakRepository &
  IDashboardTrackerRepository &
  IDashboardNotificationRepository

export interface IGetDashboardSummaryUseCase {
  execute(userId: string): Promise<IDashboardSummaryDTO>
}

export class GetDashboardSummaryUseCase implements IGetDashboardSummaryUseCase {
  constructor(
    private readonly _dashboardRepository: DashboardSummaryRepository,
    private readonly _dashboardMapper: IDashboardMapper
  ) {}

  async execute(userId: string): Promise<IDashboardSummaryDTO> {
    const [
      user,
      profile,
      streak,
      trackers,
      stats,
      recentActivity,
      unreadNotificationCount,
    ] = await Promise.all([
      this._dashboardRepository.findUserById(userId),
      this._dashboardRepository.findProfileByUserId(userId),
      this._dashboardRepository.getStreakData(userId),
      this._dashboardRepository.getTrackerOverview(userId),
      this._dashboardRepository.getAggregatedStats(userId),
      this._dashboardRepository.getRecentActivity({
        userId,
        limit: DASHBOARD_DEFAULT_RECENT_ACTIVITY_LIMIT,
      }),
      this._dashboardRepository.getUnreadNotificationCount(userId),
    ])

    if (!user) {
      throw DashboardApplicationError.userNotFound()
    }

    return {
      user: this._dashboardMapper.toUserSummary(user, profile),
      streak: this._dashboardMapper.toStreakSummary(streak),
      trackers: this._dashboardMapper.toTrackerSummary(trackers),
      stats: this._dashboardMapper.toStats(stats),
      recentActivity: recentActivity.map((activity) =>
        this._dashboardMapper.toRecentActivity(activity)
      ),
      notifications: {
        unreadCount: unreadNotificationCount,
        hasUnread: unreadNotificationCount > 0,
      },
      isPremium: user.isPremium,
    }
  }
}