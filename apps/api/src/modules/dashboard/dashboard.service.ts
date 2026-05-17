// apps/api/src/modules/dashboard/dashboard.service.ts

import { dashboardRepository } from './dashboard.repository'
import { ApiError } from '../../shared/utils/ApiError'
import { generateDashboardInsights } from '../../infrastructure/ai/ai.service'
import type { DashboardSummary } from './dashboard.types'

export const dashboardService = {
  // ─── FULL DASHBOARD SUMMARY ──────────────────────

  getSummary: async (
    userId: string
  ): Promise<DashboardSummary> => {
    const [
      { user, profile },
      streak,
      trackers,
      stats,
      recentActivity,
      unreadNotificationCount,
    ] = await Promise.all([
      dashboardRepository.getUserWithProfile(userId),
      dashboardRepository.getStreakData(userId),
      dashboardRepository.getTrackerOverview(userId),
      dashboardRepository.getAggregatedStats(userId),
      dashboardRepository.getRecentActivity(userId, 5),
      dashboardRepository.getUnreadNotificationCount(userId),
    ])

    if (!user) {
      throw new ApiError(
        404,
        'User not found',
        'NOT_FOUND'
      )
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
  },

  // ─── CURRENT ROADMAP ─────────────────────────────

  getCurrentRoadmap: async (userId: string) => {
    const trackers =
      await dashboardRepository.getTrackerOverview(userId)

    if (trackers.activeTrackers.length === 0) {
      return null
    }

    return trackers.activeTrackers[0]
  },

  // ─── ACTIVITY INTENSITY ──────────────────────────

  getActivityIntensity: async (
    userId: string,
    months?: number
  ) => {
    return dashboardRepository.getActivityIntensity(
      userId,
      months
    )
  },

  // ─── RECENT BATTLES ──────────────────────────────

  getRecentBattles: async (
    userId: string,
    limit?: number
  ) => {
    return dashboardRepository.getRecentBattles(
      userId,
      limit
    )
  },

  // ─── FRIENDS HUB ─────────────────────────────────

  getFriendsHub: async (
    userId: string,
    limit?: number
  ) => {
    return dashboardRepository.getFriendsHub(
      userId,
      limit
    )
  },

  // ─── RECOMMENDED ACTIONS ─────────────────────────

  getRecommendedActions: async (userId: string) => {
    return dashboardRepository.getRecommendedActions(userId)
  },

  // ─── AI INSIGHTS ─────────────────────────────────

  getAIInsights: async (userId: string) => {
    const [streak, trackers, stats] =
      await Promise.all([
        dashboardRepository.getStreakData(userId),
        dashboardRepository.getTrackerOverview(userId),
        dashboardRepository.getAggregatedStats(userId),
      ])

    const userData = JSON.stringify({
      streak: streak.current,
      longestStreak: streak.longest,
      activeTrackers: trackers.active,
      completedTrackers: trackers.completed,
      totalTrackers: trackers.total,
      totalTimeSpentMinutes:
        stats.totalTimeSpentMinutes,
      totalSubtopicsCompleted:
        stats.totalSubtopicsCompleted,
      totalPoints: stats.totalPoints,
      publishedTrackers: stats.publishedTrackers,
    })

    try {
      const insight =
        await generateDashboardInsights(userData)

      return {
        insight,
      }
    } catch {
      return {
        insight: `You have a ${streak.current}-day streak going. Keep it up by studying at least one subtopic today.`,
      }
    }
  },
}