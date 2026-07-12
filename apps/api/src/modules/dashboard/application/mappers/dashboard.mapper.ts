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
  IDashboardActivityIntensityItemDTO,
  IDashboardActiveTrackerDTO,
  IDashboardBattleItemDTO,
  IDashboardFriendItemDTO,
  IDashboardRecentActivityDTO,
  IDashboardRecommendedActionDTO,
  IDashboardStatsDTO,
  IDashboardStreakSummaryDTO,
  IDashboardTrackerSummaryDTO,
  IDashboardUserSummaryDTO,
} from '../dtos/dashboard.dto'

export interface IDashboardMapper {
  toUserSummary(
    user: DashboardUserEntity,
    profile?: DashboardProfileEntity | null
  ): IDashboardUserSummaryDTO

  toStreakSummary(streak: DashboardStreakEntity): IDashboardStreakSummaryDTO
  toActiveTracker(tracker: DashboardActiveTrackerEntity): IDashboardActiveTrackerDTO
  toTrackerSummary(summary: DashboardTrackerSummaryEntity): IDashboardTrackerSummaryDTO
  toStats(stats: DashboardStatsEntity): IDashboardStatsDTO
  toRecentActivity(activity: DashboardRecentActivityEntity): IDashboardRecentActivityDTO
  toActivityIntensity(item: DashboardActivityIntensityEntity): IDashboardActivityIntensityItemDTO
  toFriendItem(friend: DashboardFriendEntity): IDashboardFriendItemDTO
  toBattleItem(battle: DashboardBattleEntity): IDashboardBattleItemDTO
  toRecommendedAction(action: DashboardRecommendedActionEntity): IDashboardRecommendedActionDTO
}

export class DashboardMapper implements IDashboardMapper {
  toUserSummary(
    user: DashboardUserEntity,
    profile?: DashboardProfileEntity | null
  ): IDashboardUserSummaryDTO {
    return {
      _id: user.id,
      fullName: user.fullName,
      username: user.username,
      avatarUrl: profile?.avatarUrl ?? user.avatarUrl ?? '',
      isPremium: user.isPremium,
      coinBalance: user.coins,
    }
  }

  toStreakSummary(streak: DashboardStreakEntity): IDashboardStreakSummaryDTO {
    return {
      current: streak.current,
      longest: streak.longest,
      lastActiveAt: streak.lastActiveAt,
    }
  }

  toActiveTracker(tracker: DashboardActiveTrackerEntity): IDashboardActiveTrackerDTO {
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

  toTrackerSummary(summary: DashboardTrackerSummaryEntity): IDashboardTrackerSummaryDTO {
    return {
      total: summary.total,
      active: summary.active,
      completed: summary.completed,
      activeTrackers: summary.activeTrackers.map((tracker) =>
        this.toActiveTracker(tracker)
      ),
    }
  }

  toStats(stats: DashboardStatsEntity): IDashboardStatsDTO {
    return {
      totalSubtopicsCompleted: stats.totalSubtopicsCompleted,
      totalPoints: stats.totalPoints,
      publishedTrackers: stats.publishedTrackers,
    }
  }

  toRecentActivity(activity: DashboardRecentActivityEntity): IDashboardRecentActivityDTO {
    return {
      type: activity.type,
      description: activity.description,
      createdAt: activity.createdAt,
    }
  }

  toActivityIntensity(
    item: DashboardActivityIntensityEntity
  ): IDashboardActivityIntensityItemDTO {
    return {
      date: item.date,
      activityCount: item.activityCount,
      count: item.count,
    }
  }

  toFriendItem(friend: DashboardFriendEntity): IDashboardFriendItemDTO {
    return {
      _id: friend.id,
      fullName: friend.fullName,
      username: friend.username,
      avatarUrl: friend.avatarUrl,
      lastActiveAt: friend.lastActiveAt,
      isOnline: friend.isOnline,
    }
  }

  toBattleItem(battle: DashboardBattleEntity): IDashboardBattleItemDTO {
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
  ): IDashboardRecommendedActionDTO {
    return {
      type: action.type,
      title: action.title,
      description: action.description,
      link: action.link,
    }
  }
}
