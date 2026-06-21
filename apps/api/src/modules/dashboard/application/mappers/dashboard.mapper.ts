import type { DashboardActivityIntensityEntity } from '../../domain/entities/dashboard-activity-intensity.entity'
import type { DashboardActiveTrackerEntity } from '../../domain/entities/dashboard-active-tracker.entity'
import type { DashboardBattleEntity } from '../../domain/entities/dashboard-battle.entity'
import type { DashboardFriendEntity } from '../../domain/entities/dashboard-friend.entity'
import type { DashboardProfileEntity } from '../../domain/entities/dashboard-profile.entity'
import type { DashboardRecentActivityEntity } from '../../domain/entities/dashboard-recent-activity.entity'
import type { DashboardRecommendedActionEntity } from '../../domain/entities/dashboard-recommended-action.entity'
import type { DashboardStatsEntity } from '../../domain/entities/dashboard-stats.entity'
import type { DashboardStreakEntity } from '../../domain/entities/dashboard-streak.entity'
import type { DashboardTrackerSummaryEntity } from '../../domain/entities/dashboard-tracker-summary.entity'
import type { DashboardUserEntity } from '../../domain/entities/dashboard-user.entity'
import type {
  DashboardActivityIntensityItem,
  DashboardActiveTracker,
  DashboardBattleItem,
  DashboardFriendItem,
  DashboardRecentActivity,
  DashboardRecommendedAction,
  DashboardStats,
  DashboardStreakSummary,
  DashboardTrackerSummary,
  DashboardUserSummary,
} from '../dtos/dashboard.dto'

export interface DashboardMapperContract {
  toUserSummary(
    user: DashboardUserEntity,
    profile?: DashboardProfileEntity | null
  ): DashboardUserSummary

  toStreakSummary(streak: DashboardStreakEntity): DashboardStreakSummary
  toActiveTracker(tracker: DashboardActiveTrackerEntity): DashboardActiveTracker
  toTrackerSummary(summary: DashboardTrackerSummaryEntity): DashboardTrackerSummary
  toStats(stats: DashboardStatsEntity): DashboardStats
  toRecentActivity(activity: DashboardRecentActivityEntity): DashboardRecentActivity
  toActivityIntensity(item: DashboardActivityIntensityEntity): DashboardActivityIntensityItem
  toFriendItem(friend: DashboardFriendEntity): DashboardFriendItem
  toBattleItem(battle: DashboardBattleEntity): DashboardBattleItem
  toRecommendedAction(action: DashboardRecommendedActionEntity): DashboardRecommendedAction
}

export class DashboardMapper implements DashboardMapperContract {
  toUserSummary(
    user: DashboardUserEntity,
    profile?: DashboardProfileEntity | null
  ): DashboardUserSummary {
    return {
      _id: user.id,
      fullName: user.fullName,
      username: user.username,
      avatarUrl: profile?.avatarUrl ?? user.avatarUrl ?? '',
      isPremium: user.isPremium,
      coinBalance: user.coins,
    }
  }

  toStreakSummary(streak: DashboardStreakEntity): DashboardStreakSummary {
    return {
      current: streak.current,
      longest: streak.longest,
      lastActiveAt: streak.lastActiveAt,
    }
  }

  toActiveTracker(tracker: DashboardActiveTrackerEntity): DashboardActiveTracker {
    return {
      _id: tracker.id,
      title: tracker.title,
      level: tracker.level,
      completionPercentage: tracker.completionPercentage,
      lastStudiedAt: tracker.lastStudiedAt,
      totalTopics: tracker.totalTopics,
      completedTopics: tracker.completedTopics,
      remainingTopics: tracker.remainingTopics,
    }
  }

  toTrackerSummary(summary: DashboardTrackerSummaryEntity): DashboardTrackerSummary {
    return {
      total: summary.total,
      active: summary.active,
      completed: summary.completed,
      activeTrackers: summary.activeTrackers.map((tracker) =>
        this.toActiveTracker(tracker)
      ),
    }
  }

  toStats(stats: DashboardStatsEntity): DashboardStats {
    return {
      totalSubtopicsCompleted: stats.totalSubtopicsCompleted,
      totalPoints: stats.totalPoints,
      publishedTrackers: stats.publishedTrackers,
    }
  }

  toRecentActivity(activity: DashboardRecentActivityEntity): DashboardRecentActivity {
    return {
      type: activity.type,
      description: activity.description,
      createdAt: activity.createdAt,
    }
  }

  toActivityIntensity(
    item: DashboardActivityIntensityEntity
  ): DashboardActivityIntensityItem {
    return {
      date: item.date,
      activityCount: item.activityCount,
      count: item.count,
    }
  }

  toFriendItem(friend: DashboardFriendEntity): DashboardFriendItem {
    return {
      _id: friend.id,
      fullName: friend.fullName,
      username: friend.username,
      avatarUrl: friend.avatarUrl,
      lastActiveAt: friend.lastActiveAt,
      isOnline: friend.isOnline,
    }
  }

  toBattleItem(battle: DashboardBattleEntity): DashboardBattleItem {
    return {
      _id: battle.id,
      opponent: battle.opponent
        ? {
            _id: battle.opponent.id,
            fullName: battle.opponent.fullName,
            username: battle.opponent.username,
            avatarUrl: battle.opponent.avatarUrl,
          }
        : null,
      ...(battle.myScore !== undefined ? { myScore: battle.myScore } : {}),
      ...(battle.opponentScore !== undefined
        ? { opponentScore: battle.opponentScore }
        : {}),
      result: battle.result,
      startedAt: battle.startedAt,
      completedAt: battle.completedAt,
    }
  }

  toRecommendedAction(
    action: DashboardRecommendedActionEntity
  ): DashboardRecommendedAction {
    return {
      type: action.type,
      title: action.title,
      description: action.description,
      link: action.link,
    }
  }
}
