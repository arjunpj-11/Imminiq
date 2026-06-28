import type { DashboardNotificationRepositoryContract } from '../../domain/repositories/dashboard-notification.repository.interface'
import type { DashboardProfileRepositoryContract } from '../../domain/repositories/dashboard-profile.repository.interface'
import type { DashboardStreakRepositoryContract } from '../../domain/repositories/dashboard-streak.repository.interface'
import type { DashboardTrackerRepositoryContract } from '../../domain/repositories/dashboard-tracker.repository.interface'
import type { DashboardUserRepositoryContract } from '../../domain/repositories/dashboard-user.repository.interface'
import { DASHBOARD_DEFAULT_RECENT_ACTIVITY_LIMIT } from '../constants/dashboard.constants'
import type { DashboardSummary } from '../dtos/dashboard.dto'
import { DashboardApplicationError } from '../errors/dashboard-application.error'
import type { DashboardMapperContract } from '../mappers/dashboard.mapper'

type DashboardSummaryRepository =
  DashboardUserRepositoryContract &
  DashboardProfileRepositoryContract &
  DashboardStreakRepositoryContract &
  DashboardTrackerRepositoryContract &
  DashboardNotificationRepositoryContract

export class GetDashboardSummaryUseCase {
  constructor(
    private readonly _dashboardRepository: DashboardSummaryRepository,
    private readonly _dashboardMapper: DashboardMapperContract
  ) {}

  async execute(userId: string): Promise<DashboardSummary> {
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