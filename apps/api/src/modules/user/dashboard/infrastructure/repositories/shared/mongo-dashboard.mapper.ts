import {
  DASHBOARD_ACTIVE_TRACKERS_LIMIT,
  DASHBOARD_ONLINE_WINDOW_MS,
} from '../../../domain/dashboard.constants';
import { DashboardActiveTrackerEntity } from '../../../domain/entities/dashboard-active-tracker.entity';
import { DashboardActivityIntensityEntity } from '../../../domain/entities/dashboard-activity-intensity.entity';
import { DashboardBattleEntity } from '../../../domain/entities/dashboard-battle.entity';
import { DashboardFriendEntity } from '../../../domain/entities/dashboard-friend.entity';
import { DashboardProfileEntity } from '../../../domain/entities/dashboard-profile.entity';
import { DashboardRecentActivityEntity } from '../../../domain/entities/dashboard-recent-activity.entity';
import { DashboardStatsEntity } from '../../../domain/entities/dashboard-stats.entity';
import { DashboardStreakEntity } from '../../../domain/entities/dashboard-streak.entity';
import { DashboardTrackerSummaryEntity } from '../../../domain/entities/dashboard-tracker-summary.entity';
import { DashboardUserEntity } from '../../../domain/entities/dashboard-user.entity';
import type { DashboardBattleResult } from '../../../domain/value-objects/dashboard-battle-result.vo';
import type { DashboardIntensityLevel } from '../../../domain/value-objects/dashboard-intensity-level.vo';
import type { DashboardRecommendationContext } from '../../../domain/value-objects/dashboard-recommendation-context.vo';
import type {
  MongoBattleRecord,
  MongoIdLike,
  MongoNotificationRecord,
  MongoProgressAggregationRecord,
  MongoStreakHistoryRecord,
  MongoStreakSnapshotRecord,
  MongoTrackerProgressRecord,
  MongoTrackerRecord,
  MongoTrackerTitleRecord,
  MongoUserProfileRecord,
  MongoUserRecord,
} from './mongo-dashboard.types';

export class MongoDashboardMapper {
  toId(value: MongoIdLike | string): string {
    return typeof value === 'string' ? value : value.toString();
  }

  toDashboardUserEntity(user: MongoUserRecord | null): DashboardUserEntity | null {
    if (!user) {
      return null;
    }

    return new DashboardUserEntity({
      id: this.toId(user._id),
      fullName: user.fullName,
      username: user.username,
      avatarUrl: user.avatarUrl,
      isPremium: Boolean(user.isPremium),
      coins: user.coins,
      lastActiveAt: user.lastActiveAt,
    });
  }

  toDashboardProfileEntity(profile: MongoUserProfileRecord | null): DashboardProfileEntity | null {
    if (!profile) {
      return null;
    }

    return new DashboardProfileEntity({
      userId: this.toId(profile.userId),
      avatarUrl: profile.avatarUrl,
    });
  }

  toDashboardStreakEntity(streak: MongoStreakSnapshotRecord | null): DashboardStreakEntity {
    return new DashboardStreakEntity({
      current: streak?.currentStreak ?? 0,
      longest: streak?.longestStreak ?? 0,
      lastActiveAt: streak?.snapshotDate ?? null,
    });
  }

  toDashboardActiveTrackerEntity(
    tracker: MongoTrackerRecord,
    progress?: MongoTrackerProgressRecord
  ): DashboardActiveTrackerEntity {
    const totalTopics = tracker.topicsCount ?? 0;
    const completedTopics = progress?.completedTopics ?? 0;

    return new DashboardActiveTrackerEntity({
      id: this.toId(tracker._id),
      title: tracker.title,
      level: tracker.level ?? '',
      completionPercentage: progress?.completionPercentage ?? 0,
      lastStudiedAt: progress?.lastStudiedAt ?? null,
      updatedAt: tracker.updatedAt ?? null,
      totalTopics,
      completedTopics,
      remainingTopics: Math.max(0, totalTopics - completedTopics),
    });
  }

  toDashboardTrackerSummaryEntity(
    trackers: DashboardActiveTrackerEntity[]
  ): DashboardTrackerSummaryEntity {
    const activeTrackerList = trackers.filter((tracker) => tracker.completionPercentage < 100);

    const completedTrackerList = trackers.filter((tracker) => tracker.completionPercentage >= 100);

    const activeTrackers = [...activeTrackerList]
      .sort(
        (first, second) => this.getTrackerActivityTime(second) - this.getTrackerActivityTime(first)
      )
      .slice(0, DASHBOARD_ACTIVE_TRACKERS_LIMIT);

    return new DashboardTrackerSummaryEntity({
      total: trackers.length,
      active: activeTrackerList.length,
      completed: completedTrackerList.length,
      activeTrackers: activeTrackers.map((tracker) => ({
        id: tracker.id,
        title: tracker.title,
        level: tracker.level,
        completionPercentage: tracker.completionPercentage,
        lastStudiedAt: tracker.lastStudiedAt,
        totalTopics: tracker.totalTopics,
        completedTopics: tracker.completedTopics,
        remainingTopics: tracker.remainingTopics,
        updatedAt: tracker.updatedAt,
      })),
    });
  }

  toDashboardStatsEntity(
    aggregation: MongoProgressAggregationRecord | undefined,
    publishedTrackers: number,
    user: Pick<MongoUserRecord, 'coins'> | null
  ): DashboardStatsEntity {
    return new DashboardStatsEntity({
      totalSubtopicsCompleted: aggregation?.totalSubtopicsCompleted ?? 0,
      totalPoints: user?.coins ?? 0,
      publishedTrackers,
    });
  }

  toDashboardRecentActivityEntity(
    notification: MongoNotificationRecord
  ): DashboardRecentActivityEntity {
    return new DashboardRecentActivityEntity({
      type: notification.type,
      description: notification.message,
      createdAt: notification.createdAt,
    });
  }

  toDashboardActivityIntensityEntity(
    entry: MongoStreakHistoryRecord
  ): DashboardActivityIntensityEntity {
    return new DashboardActivityIntensityEntity({
      date: new Date(entry.date).toISOString().split('T')[0] ?? '',
      activityCount: entry.activityCount ?? 0,
      count: this.toIntensityCount(entry.intensityLevel, Boolean(entry.isFrozen)),
    });
  }

  toDashboardBattleEntity(
    battle: MongoBattleRecord,
    userId: string,
    opponentMap: Map<string, MongoUserRecord>,
    profileMap: Map<string, string>
  ): DashboardBattleEntity {
    const opponentId = this.getOpponentId(battle, userId);
    const opponent = opponentMap.get(opponentId);
    const isPlayerOne = this.toId(battle.playerOneId) === userId;

    return new DashboardBattleEntity({
      id: this.toId(battle._id),
      opponent: opponent
        ? {
            id: this.toId(opponent._id),
            fullName: opponent.fullName,
            username: opponent.username,
            avatarUrl: profileMap.get(opponentId) ?? '',
          }
        : null,
      myScore: isPlayerOne
        ? (battle.playerOneScore ?? undefined)
        : (battle.playerTwoScore ?? undefined),
      opponentScore: isPlayerOne
        ? (battle.playerTwoScore ?? undefined)
        : (battle.playerOneScore ?? undefined),
      result: this.getBattleResult(battle, userId),
      startedAt: battle.startedAt ?? null,
      completedAt: battle.endedAt ?? battle.updatedAt,
    });
  }

  toDashboardFriendEntity(
    friend: MongoUserRecord,
    profileMap: Map<string, string>
  ): DashboardFriendEntity {
    return new DashboardFriendEntity({
      id: this.toId(friend._id),
      fullName: friend.fullName,
      username: friend.username,
      avatarUrl: profileMap.get(this.toId(friend._id)) || friend.avatarUrl || '',
      lastActiveAt: friend.lastActiveAt ?? null,
      isOnline: this.isUserOnline(friend.lastActiveAt),
    });
  }

  toDashboardRecommendationContext(
    totalTrackers: number,
    progress: MongoTrackerProgressRecord | null,
    tracker: MongoTrackerTitleRecord | null
  ): DashboardRecommendationContext {
    return {
      totalTrackers,
      latestIncompleteTracker:
        progress && tracker
          ? {
              id: this.toId(tracker._id),
              title: tracker.title,
              completionPercentage: progress.completionPercentage ?? 0,
            }
          : null,
    };
  }

  getOpponentId(battle: MongoBattleRecord, userId: string): string {
    const playerOneId = this.toId(battle.playerOneId);
    const playerTwoId = this.toId(battle.playerTwoId);

    return playerOneId === userId ? playerTwoId : playerOneId;
  }

  private getTrackerActivityTime(tracker: DashboardActiveTrackerEntity): number {
    return new Date(tracker.lastStudiedAt ?? tracker.updatedAt ?? 0).getTime();
  }

  private toIntensityCount(
    intensityLevel?: DashboardIntensityLevel | null,
    isFrozen = false
  ): number {
    if (intensityLevel === 'high') return 4;
    if (intensityLevel === 'medium') return 3;
    if (intensityLevel === 'low') return 2;
    if (isFrozen) return 1;

    return 0;
  }

  private getBattleResult(battle: MongoBattleRecord, userId: string): DashboardBattleResult {
    if (!battle.winnerId) {
      return 'draw';
    }

    return this.toId(battle.winnerId) === userId ? 'win' : 'loss';
  }

  private isUserOnline(lastActiveAt?: Date | null): boolean {
    if (!lastActiveAt) {
      return false;
    }

    return Date.now() - lastActiveAt.getTime() < DASHBOARD_ONLINE_WINDOW_MS;
  }
}
