import type {
  DashboardActivityIntensityItem,
  DashboardRecentActivity,
  DashboardRecommendedAction,
  DashboardStats,
  DashboardStreakSummary,
  DashboardTrackerSummary,
} from '../types/dashboard.types'

export interface DashboardUserRecord {
  _id: {
    toString(): string
  }
  fullName: string
  username: string
  isPremium: boolean
  coins?: number | null
}

export interface DashboardProfileRecord {
  avatarUrl?: string | null
}

export interface DashboardUserWithProfileRecord {
  user: DashboardUserRecord | null
  profile: DashboardProfileRecord | null
}

export interface DashboardRepository {
  getUserWithProfile(
    userId: string
  ): Promise<DashboardUserWithProfileRecord>

  getStreakData(userId: string): Promise<DashboardStreakSummary>

  getTrackerOverview(userId: string): Promise<DashboardTrackerSummary>

  getAggregatedStats(userId: string): Promise<DashboardStats>

  getRecentActivity(
    userId: string,
    limit?: number
  ): Promise<DashboardRecentActivity[]>

  getUnreadNotificationCount(userId: string): Promise<number>

  getActivityIntensity(
    userId: string,
    months?: number
  ): Promise<DashboardActivityIntensityItem[]>

  getRecentBattles(
    userId: string,
    limit?: number
  ): Promise<unknown[]>

  getFriendsHub(
    userId: string,
    limit?: number
  ): Promise<unknown[]>

  getRecommendedActions(
    userId: string
  ): Promise<DashboardRecommendedAction[]>
}
