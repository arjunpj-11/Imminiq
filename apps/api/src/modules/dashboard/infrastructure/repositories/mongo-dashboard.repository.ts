import mongoose from 'mongoose'

import { Notification } from '../../../../infrastructure/database/models/notification.model'
import { StreakHistory } from '../../../../infrastructure/database/models/streak-history.model'
import { StreakSnapshot } from '../../../../infrastructure/database/models/streak-snapshot.model'
import { Tracker } from '../../../../infrastructure/database/models/tracker.model'
import { TrackerProgress } from '../../../../infrastructure/database/models/tracker-progress.model'
import { User } from '../../../../infrastructure/database/models/user.model'
import { UserProfile } from '../../../../infrastructure/database/models/user-profile.model'
import {
  DASHBOARD_ACTIVE_TRACKERS_LIMIT,
  DASHBOARD_DEFAULT_ACTIVITY_MONTHS,
  DASHBOARD_DEFAULT_FRIENDS_LIMIT,
  DASHBOARD_DEFAULT_RECENT_ACTIVITY_LIMIT,
  DASHBOARD_DEFAULT_RECENT_BATTLES_LIMIT,
  DASHBOARD_MAX_RECENT_ITEMS_LIMIT,
  DASHBOARD_ONLINE_WINDOW_MS,
} from '../../domain/constants/dashboard.constants'
import { DashboardActiveTrackerEntity } from '../../domain/entities/dashboard-active-tracker.entity'
import { DashboardActivityIntensityEntity } from '../../domain/entities/dashboard-activity-intensity.entity'
import { DashboardBattleEntity } from '../../domain/entities/dashboard-battle.entity'
import { DashboardFriendEntity } from '../../domain/entities/dashboard-friend.entity'
import { DashboardProfileEntity } from '../../domain/entities/dashboard-profile.entity'
import { DashboardRecentActivityEntity } from '../../domain/entities/dashboard-recent-activity.entity'
import { DashboardStatsEntity } from '../../domain/entities/dashboard-stats.entity'
import { DashboardStreakEntity } from '../../domain/entities/dashboard-streak.entity'
import { DashboardTrackerSummaryEntity } from '../../domain/entities/dashboard-tracker-summary.entity'
import { DashboardUserEntity } from '../../domain/entities/dashboard-user.entity'
import { DashboardDomainError } from '../../domain/errors/dashboard-domain.error'
import type { DashboardRepositoryContract } from '../../domain/repositories/dashboard.repository.interface'
import type { DashboardBattleResult } from '../../domain/value-objects/dashboard-battle-result.vo'
import type { DashboardIntensityLevel } from '../../domain/value-objects/dashboard-intensity-level.vo'
import type { DashboardRecommendationContext } from '../../domain/value-objects/dashboard-recommendation-context.vo'

type MongoIdLike = {
  toString(): string
}

type MongoUserRecord = {
  _id: MongoIdLike
  fullName: string
  username: string
  avatarUrl?: string | null
  isPremium?: boolean
  coins?: number | null
  lastActiveAt?: Date | null
}

type MongoUserProfileRecord = {
  userId: MongoIdLike | string
  avatarUrl?: string | null
}

type MongoStreakSnapshotRecord = {
  currentStreak?: number | null
  longestStreak?: number | null
  snapshotDate?: Date | null
}

type MongoTrackerRecord = {
  _id: MongoIdLike
  title: string
  level?: string | null
  updatedAt?: Date | null
  topicsCount?: number | null
}

type MongoTrackerProgressRecord = {
  trackerId: MongoIdLike | string
  completionPercentage?: number | null
  lastStudiedAt?: Date | null
  completedTopics?: number | null
}

type MongoProgressAggregationRecord = {
  totalSubtopicsCompleted?: number | null
}

type MongoNotificationRecord = {
  type: string
  message: string
  createdAt: Date
}

type MongoStreakHistoryRecord = {
  date: Date
  activityCount?: number | null
  intensityLevel?: DashboardIntensityLevel | null
  isFrozen?: boolean | null
}

type MongoBattleRecord = {
  _id: MongoIdLike
  playerOneId: MongoIdLike | string
  playerTwoId: MongoIdLike | string
  winnerId?: MongoIdLike | string | null
  playerOneScore?: number | null
  playerTwoScore?: number | null
  startedAt?: Date | null
  endedAt?: Date | null
  updatedAt: Date
}

type MongoFriendRecord = {
  userId: MongoIdLike | string
  friendId: MongoIdLike | string
}

type MongoTrackerTitleRecord = {
  _id: MongoIdLike
  title: string
}

export class MongoDashboardRepository implements DashboardRepositoryContract {
  async findUserById(userId: string): Promise<DashboardUserEntity | null> {
    return this.execute(
      'DASHBOARD_USER_READ_FAILED',
      'Failed to read dashboard user',
      async () => {
        const user = await User.findById(userId)
          .select('_id fullName username avatarUrl isPremium coins lastActiveAt')
          .lean<MongoUserRecord>()

        return this.toDashboardUserEntity(user)
      }
    )
  }

  async findProfileByUserId(
    userId: string
  ): Promise<DashboardProfileEntity | null> {
    return this.execute(
      'DASHBOARD_PROFILE_READ_FAILED',
      'Failed to read dashboard profile',
      async () => {
        const profile = await UserProfile.findOne({ userId })
          .select('userId avatarUrl')
          .lean<MongoUserProfileRecord>()

        return this.toDashboardProfileEntity(profile)
      }
    )
  }

  async getStreakData(userId: string): Promise<DashboardStreakEntity> {
    return this.execute(
      'DASHBOARD_STREAK_READ_FAILED',
      'Failed to read dashboard streak',
      async () => {
        const streak = await StreakSnapshot.findOne({ userId, deletedAt: null })
          .sort({ snapshotDate: -1 })
          .select('currentStreak longestStreak snapshotDate')
          .lean<MongoStreakSnapshotRecord>()

        return this.toDashboardStreakEntity(streak)
      }
    )
  }

  async getTrackerOverview(
    userId: string
  ): Promise<DashboardTrackerSummaryEntity> {
    return this.execute(
      'DASHBOARD_TRACKER_READ_FAILED',
      'Failed to read dashboard trackers',
      async () => {
        const [allTrackers, allProgress] = await Promise.all([
          Tracker.find({
            ownerId: userId,
            status: { $ne: 'archived' },
          })
            .select('_id title level updatedAt topicsCount')
            .sort({ updatedAt: -1 })
            .lean<MongoTrackerRecord[]>(),
          TrackerProgress.find({ userId })
            .select('trackerId completionPercentage lastStudiedAt completedTopics')
            .lean<MongoTrackerProgressRecord[]>(),
        ])

        const progressMap = new Map(
          allProgress.map((progress) => [this.toId(progress.trackerId), progress])
        )

        const trackersWithProgress = allTrackers.map((tracker) =>
          this.toDashboardActiveTrackerEntity(
            tracker,
            progressMap.get(this.toId(tracker._id))
          )
        )

        return this.toDashboardTrackerSummaryEntity(trackersWithProgress)
      }
    )
  }

  async getAggregatedStats(userId: string): Promise<DashboardStatsEntity> {
    return this.execute(
      'DASHBOARD_STATS_READ_FAILED',
      'Failed to read dashboard statistics',
      async () => {
        const [progressAggregation, publishedTrackers, user] = await Promise.all([
          TrackerProgress.aggregate<MongoProgressAggregationRecord>([
            {
              $match: {
                userId: new mongoose.Types.ObjectId(userId),
              },
            },
            {
              $group: {
                _id: null,
                totalSubtopicsCompleted: {
                  $sum: { $ifNull: ['$completedSubtopics', 0] },
                },
              },
            },
          ]),
          Tracker.countDocuments({ ownerId: userId, visibility: 'public' }),
          User.findById(userId)
            .select('coins')
            .lean<Pick<MongoUserRecord, 'coins'>>(),
        ])

        return this.toDashboardStatsEntity(
          progressAggregation[0],
          publishedTrackers,
          user
        )
      }
    )
  }

  async getRecentActivity(
    userId: string,
    limit = DASHBOARD_DEFAULT_RECENT_ACTIVITY_LIMIT
  ): Promise<DashboardRecentActivityEntity[]> {
    return this.execute(
      'DASHBOARD_ACTIVITY_READ_FAILED',
      'Failed to read recent dashboard activity',
      async () => {
        const notifications = await Notification.find({ userId })
          .sort({ createdAt: -1 })
          .limit(this.safeLimit(limit, DASHBOARD_DEFAULT_RECENT_ACTIVITY_LIMIT))
          .select('type message createdAt')
          .lean<MongoNotificationRecord[]>()

        return notifications.map((notification) =>
          this.toDashboardRecentActivityEntity(notification)
        )
      }
    )
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    return this.execute(
      'DASHBOARD_NOTIFICATION_READ_FAILED',
      'Failed to read dashboard notification count',
      () => Notification.countDocuments({ userId, isRead: false })
    )
  }

  async getActivityIntensity(
    userId: string,
    months = DASHBOARD_DEFAULT_ACTIVITY_MONTHS
  ): Promise<DashboardActivityIntensityEntity[]> {
    return this.execute(
      'DASHBOARD_INTENSITY_READ_FAILED',
      'Failed to read dashboard activity intensity',
      async () => {
        const fromDate = new Date()
        fromDate.setMonth(fromDate.getMonth() - months)

        const streakEntries = await StreakHistory.find({
          userId,
          date: { $gte: fromDate },
          deletedAt: null,
        })
          .sort({ date: 1 })
          .select('date activityCount intensityLevel isFrozen')
          .lean<MongoStreakHistoryRecord[]>()

        return streakEntries.map((entry) =>
          this.toDashboardActivityIntensityEntity(entry)
        )
      }
    )
  }

  async getRecentBattles(
    userId: string,
    limit = DASHBOARD_DEFAULT_RECENT_BATTLES_LIMIT
  ): Promise<DashboardBattleEntity[]> {
    return this.execute(
      'DASHBOARD_BATTLE_READ_FAILED',
      'Failed to read recent dashboard battles',
      async () => {
        const { Battle } = await import(
          '../../../../infrastructure/database/models/battle.model'
        )
        const battles = (await Battle.find({
          $or: [{ playerOneId: userId }, { playerTwoId: userId }],
          status: 'completed',
        })
          .sort({ endedAt: -1, updatedAt: -1 })
          .limit(this.safeLimit(limit, DASHBOARD_DEFAULT_RECENT_BATTLES_LIMIT))
          .select(
            '_id playerOneId playerTwoId winnerId playerOneScore playerTwoScore startedAt endedAt updatedAt'
          )
          .lean()) as MongoBattleRecord[]

        if (battles.length === 0) {
          return []
        }

        const opponentIds = battles.map((battle) =>
          this.getOpponentId(battle, userId)
        )
        const [opponents, opponentProfiles] = await Promise.all([
          User.find({ _id: { $in: opponentIds } })
            .select('_id fullName username')
            .lean<MongoUserRecord[]>(),
          UserProfile.find({ userId: { $in: opponentIds } })
            .select('userId avatarUrl')
            .lean<MongoUserProfileRecord[]>(),
        ])
        const opponentMap = new Map(
          opponents.map((opponent) => [this.toId(opponent._id), opponent])
        )
        const profileMap = new Map(
          opponentProfiles.map((profile) => [
            this.toId(profile.userId),
            profile.avatarUrl ?? '',
          ])
        )

        return battles.map((battle) =>
          this.toDashboardBattleEntity(
            battle,
            userId,
            opponentMap,
            profileMap
          )
        )
      }
    )
  }

  async getFriendsHub(
    userId: string,
    limit = DASHBOARD_DEFAULT_FRIENDS_LIMIT
  ): Promise<DashboardFriendEntity[]> {
    return this.execute(
      'DASHBOARD_FRIEND_READ_FAILED',
      'Failed to read dashboard friends',
      async () => {
        const { Friend } = await import(
          '../../../../infrastructure/database/models/friend.model'
        )
        const friendships = (await Friend.find({
          $or: [{ userId }, { friendId: userId }],
        })
          .limit(this.safeLimit(limit, DASHBOARD_DEFAULT_FRIENDS_LIMIT))
          .lean()) as MongoFriendRecord[]

        if (friendships.length === 0) {
          return []
        }

        const friendIds = friendships.map((friendship) =>
          this.toId(friendship.userId) === userId
            ? this.toId(friendship.friendId)
            : this.toId(friendship.userId)
        )
        const [friends, friendProfiles] = await Promise.all([
          User.find({ _id: { $in: friendIds } })
            .select('_id fullName username lastActiveAt')
            .lean<MongoUserRecord[]>(),
          UserProfile.find({ userId: { $in: friendIds } })
            .select('userId avatarUrl')
            .lean<MongoUserProfileRecord[]>(),
        ])
        const profileMap = new Map(
          friendProfiles.map((profile) => [
            this.toId(profile.userId),
            profile.avatarUrl ?? '',
          ])
        )

        return friends.map((friend) =>
          this.toDashboardFriendEntity(friend, profileMap)
        )
      }
    )
  }

  async getRecommendationContext(
    userId: string
  ): Promise<DashboardRecommendationContext> {
    return this.execute(
      'DASHBOARD_RECOMMENDATION_READ_FAILED',
      'Failed to read dashboard recommendation context',
      async () => {
        const [latestProgress, totalTrackers] = await Promise.all([
          TrackerProgress.findOne({
            userId,
            completionPercentage: { $lt: 100 },
          })
            .sort({ lastStudiedAt: -1 })
            .select('trackerId completionPercentage lastStudiedAt')
            .lean<MongoTrackerProgressRecord>(),
          Tracker.countDocuments({ ownerId: userId, deletedAt: null }),
        ])

        const tracker = latestProgress
          ? await Tracker.findOne({
              _id: latestProgress.trackerId,
              ownerId: userId,
              deletedAt: null,
            })
              .select('_id title')
              .lean<MongoTrackerTitleRecord>()
          : null

        return this.toDashboardRecommendationContext(
          totalTrackers,
          latestProgress,
          tracker
        )
      }
    )
  }

  private async execute<T>(
    code: string,
    message: string,
    operation: () => Promise<T>
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      if (error instanceof DashboardDomainError) {
        throw error
      }

      throw new DashboardDomainError(code, message)
    }
  }

  private safeLimit(limit: number | undefined, fallback: number): number {
    if (!limit || !Number.isFinite(limit)) {
      return fallback
    }

    return Math.max(
      1,
      Math.min(DASHBOARD_MAX_RECENT_ITEMS_LIMIT, Math.trunc(limit))
    )
  }

  private toId(value: MongoIdLike | string): string {
    return typeof value === 'string' ? value : value.toString()
  }

  private toDashboardUserEntity(
    user: MongoUserRecord | null
  ): DashboardUserEntity | null {
    if (!user) {
      return null
    }

    return new DashboardUserEntity({
      id: this.toId(user._id),
      fullName: user.fullName,
      username: user.username,
      avatarUrl: user.avatarUrl,
      isPremium: Boolean(user.isPremium),
      coins: user.coins,
      lastActiveAt: user.lastActiveAt,
    })
  }

  private toDashboardProfileEntity(
    profile: MongoUserProfileRecord | null
  ): DashboardProfileEntity | null {
    if (!profile) {
      return null
    }

    return new DashboardProfileEntity({
      userId: this.toId(profile.userId),
      avatarUrl: profile.avatarUrl,
    })
  }

  private toDashboardStreakEntity(
    streak: MongoStreakSnapshotRecord | null
  ): DashboardStreakEntity {
    return new DashboardStreakEntity({
      current: streak?.currentStreak ?? 0,
      longest: streak?.longestStreak ?? 0,
      lastActiveAt: streak?.snapshotDate ?? null,
    })
  }

  private toDashboardActiveTrackerEntity(
    tracker: MongoTrackerRecord,
    progress?: MongoTrackerProgressRecord
  ): DashboardActiveTrackerEntity {
    const totalTopics = tracker.topicsCount ?? 0
    const completedTopics = progress?.completedTopics ?? 0

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
    })
  }

  private toDashboardTrackerSummaryEntity(
    trackers: DashboardActiveTrackerEntity[]
  ): DashboardTrackerSummaryEntity {
    const activeTrackerList = trackers.filter(
      (tracker) => tracker.completionPercentage < 100
    )
    const completedTrackerList = trackers.filter(
      (tracker) => tracker.completionPercentage >= 100
    )
    const activeTrackers = [...activeTrackerList]
      .sort((first, second) =>
        this.getTrackerActivityTime(second) - this.getTrackerActivityTime(first)
      )
      .slice(0, DASHBOARD_ACTIVE_TRACKERS_LIMIT)

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
    })
  }

  private toDashboardStatsEntity(
    aggregation: MongoProgressAggregationRecord | undefined,
    publishedTrackers: number,
    user: Pick<MongoUserRecord, 'coins'> | null
  ): DashboardStatsEntity {
    return new DashboardStatsEntity({
      totalSubtopicsCompleted: aggregation?.totalSubtopicsCompleted ?? 0,
      totalPoints: user?.coins ?? 0,
      publishedTrackers,
    })
  }

  private toDashboardRecentActivityEntity(
    notification: MongoNotificationRecord
  ): DashboardRecentActivityEntity {
    return new DashboardRecentActivityEntity({
      type: notification.type,
      description: notification.message,
      createdAt: notification.createdAt,
    })
  }

  private toDashboardActivityIntensityEntity(
    entry: MongoStreakHistoryRecord
  ): DashboardActivityIntensityEntity {
    return new DashboardActivityIntensityEntity({
      date: new Date(entry.date).toISOString().split('T')[0] ?? '',
      activityCount: entry.activityCount ?? 0,
      count: this.toIntensityCount(
        entry.intensityLevel,
        Boolean(entry.isFrozen)
      ),
    })
  }

  private toDashboardBattleEntity(
    battle: MongoBattleRecord,
    userId: string,
    opponentMap: Map<string, MongoUserRecord>,
    profileMap: Map<string, string>
  ): DashboardBattleEntity {
    const opponentId = this.getOpponentId(battle, userId)
    const opponent = opponentMap.get(opponentId)
    const isPlayerOne = this.toId(battle.playerOneId) === userId

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
        ? battle.playerOneScore ?? undefined
        : battle.playerTwoScore ?? undefined,
      opponentScore: isPlayerOne
        ? battle.playerTwoScore ?? undefined
        : battle.playerOneScore ?? undefined,
      result: this.getBattleResult(battle, userId),
      startedAt: battle.startedAt ?? null,
      completedAt: battle.endedAt ?? battle.updatedAt,
    })
  }

  private toDashboardFriendEntity(
    friend: MongoUserRecord,
    profileMap: Map<string, string>
  ): DashboardFriendEntity {
    return new DashboardFriendEntity({
      id: this.toId(friend._id),
      fullName: friend.fullName,
      username: friend.username,
      avatarUrl: profileMap.get(this.toId(friend._id)) ?? '',
      lastActiveAt: friend.lastActiveAt ?? null,
      isOnline: this.isUserOnline(friend.lastActiveAt),
    })
  }

  private toDashboardRecommendationContext(
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
    }
  }

  private getTrackerActivityTime(tracker: DashboardActiveTrackerEntity): number {
    return new Date(tracker.lastStudiedAt ?? tracker.updatedAt ?? 0).getTime()
  }

  private toIntensityCount(
    intensityLevel?: DashboardIntensityLevel | null,
    isFrozen = false
  ): number {
    if (intensityLevel === 'high') return 4
    if (intensityLevel === 'medium') return 3
    if (intensityLevel === 'low') return 2
    if (isFrozen) return 1
    return 0
  }

  private getOpponentId(battle: MongoBattleRecord, userId: string): string {
    const playerOneId = this.toId(battle.playerOneId)
    const playerTwoId = this.toId(battle.playerTwoId)
    return playerOneId === userId ? playerTwoId : playerOneId
  }

  private getBattleResult(
    battle: MongoBattleRecord,
    userId: string
  ): DashboardBattleResult {
    if (!battle.winnerId) {
      return 'draw'
    }

    return this.toId(battle.winnerId) === userId ? 'win' : 'loss'
  }

  private isUserOnline(lastActiveAt?: Date | null): boolean {
    if (!lastActiveAt) {
      return false
    }

    return Date.now() - lastActiveAt.getTime() < DASHBOARD_ONLINE_WINDOW_MS
  }
}

export const mongoDashboardRepository = new MongoDashboardRepository()
