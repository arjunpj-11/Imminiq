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
    private readonly dashboardRepository: DashboardSummaryRepository,
    private readonly dashboardMapper: DashboardMapperContract
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
      this.dashboardRepository.findUserById(userId),
      this.dashboardRepository.findProfileByUserId(userId),
      this.dashboardRepository.getStreakData(userId),
      this.dashboardRepository.getTrackerOverview(userId),
      this.dashboardRepository.getAggregatedStats(userId),
      this.dashboardRepository.getRecentActivity({
        userId,
        limit: DASHBOARD_DEFAULT_RECENT_ACTIVITY_LIMIT,
      }),
      this.dashboardRepository.getUnreadNotificationCount(userId),
    ])

    if (!user) {
      throw DashboardApplicationError.userNotFound()
    }

    return {
      user: this.dashboardMapper.toUserSummary(user, profile),
      streak: this.dashboardMapper.toStreakSummary(streak),
      trackers: this.dashboardMapper.toTrackerSummary(trackers),
      stats: this.dashboardMapper.toStats(stats),
      recentActivity: recentActivity.map((activity) =>
        this.dashboardMapper.toRecentActivity(activity)
      ),
      notifications: {
        unreadCount: unreadNotificationCount,
        hasUnread: unreadNotificationCount > 0,
      },
      isPremium: user.isPremium,
    }
  }
}