import { Battle } from '../../../../infrastructure/database/models/battle.model'
import { Friend } from '../../../../infrastructure/database/models/friend.model'
import { Notification } from '../../../../infrastructure/database/models/notification.model'
import { StreakHistory } from '../../../../infrastructure/database/models/streak-history.model'
import { StreakSnapshot } from '../../../../infrastructure/database/models/streak-snapshot.model'
import { Tracker } from '../../../../infrastructure/database/models/tracker.model'
import { TrackerProgress } from '../../../../infrastructure/database/models/tracker-progress.model'
import { User } from '../../../../infrastructure/database/models/user.model'
import { UserProfile } from '../../../../infrastructure/database/models/user-profile.model'
import {
  DASHBOARD_DEFAULT_ACTIVITY_MONTHS,
  DASHBOARD_DEFAULT_FRIENDS_LIMIT,
  DASHBOARD_DEFAULT_RECENT_ACTIVITY_LIMIT,
  DASHBOARD_DEFAULT_RECENT_BATTLES_LIMIT,
} from '../../domain/constants/dashboard.constants'
import type { DashboardActivityIntensityEntity } from '../../domain/entities/dashboard-activity-intensity.entity'
import type { DashboardBattleEntity } from '../../domain/entities/dashboard-battle.entity'
import type { DashboardFriendEntity } from '../../domain/entities/dashboard-friend.entity'
import type { DashboardProfileEntity } from '../../domain/entities/dashboard-profile.entity'
import type { DashboardRecentActivityEntity } from '../../domain/entities/dashboard-recent-activity.entity'
import type { DashboardStatsEntity } from '../../domain/entities/dashboard-stats.entity'
import type { DashboardStreakEntity } from '../../domain/entities/dashboard-streak.entity'
import type { DashboardTrackerSummaryEntity } from '../../domain/entities/dashboard-tracker-summary.entity'
import type { DashboardUserEntity } from '../../domain/entities/dashboard-user.entity'
import type { GetRecentBattlesInput } from '../../domain/repositories/dashboard-battle.repository.interface'
import type { GetFriendsHubInput } from '../../domain/repositories/dashboard-friend.repository.interface'
import type { GetRecentActivityInput } from '../../domain/repositories/dashboard-notification.repository.interface'
import type { DashboardRepositoryContract } from '../../domain/repositories/dashboard.repository.interface'
import type { GetActivityIntensityInput } from '../../domain/repositories/dashboard-streak.repository.interface'
import type { DashboardRecommendationContext } from '../../domain/value-objects/dashboard-recommendation-context.vo'
import { MongoDashboardBaseRepository } from './mongo-dashboard-base.repository'
import { MongoDashboardErrorMapper } from './mongo-dashboard-error.mapper'
import { MongoDashboardMapper } from './mongo-dashboard.mapper'
import type {
  MongoBattleRecord,
  MongoFriendRecord,
  MongoNotificationRecord,
  MongoProgressAggregationRecord,
  MongoStreakHistoryRecord,
  MongoStreakSnapshotRecord,
  MongoTrackerProgressRecord,
  MongoTrackerRecord,
  MongoTrackerTitleRecord,
  MongoUserProfileRecord,
  MongoUserRecord,
} from './mongo-dashboard.types'

export class MongoDashboardRepository
  extends MongoDashboardBaseRepository
  implements DashboardRepositoryContract
{
  constructor(private readonly _mapper = new MongoDashboardMapper()) {
    super()
  }

  async findUserById(userId: string): Promise<DashboardUserEntity | null> {
    return this.execute(
      'DASHBOARD_USER_READ_FAILED',
      'Failed to read dashboard user',
      async () => {
        const user = await User.findOne({
          _id: userId,
          deletedAt: null,
        })
          .select('_id fullName username avatarUrl isPremium coins lastActiveAt')
          .lean<MongoUserRecord>()

        return this._mapper.toDashboardUserEntity(user)
      },
      MongoDashboardErrorMapper.mapMongoError,
    )
  }

  async findProfileByUserId(
    userId: string,
  ): Promise<DashboardProfileEntity | null> {
    return this.execute(
      'DASHBOARD_PROFILE_READ_FAILED',
      'Failed to read dashboard profile',
      async () => {
        const profile = await UserProfile.findOne({
          userId,
          deletedAt: null,
        })
          .select('userId avatarUrl')
          .lean<MongoUserProfileRecord>()

        return this._mapper.toDashboardProfileEntity(profile)
      },
      MongoDashboardErrorMapper.mapMongoError,
    )
  }

  async getStreakData(userId: string): Promise<DashboardStreakEntity> {
    return this.execute(
      'DASHBOARD_STREAK_READ_FAILED',
      'Failed to read dashboard streak',
      async () => {
        const streak = await StreakSnapshot.findOne({
          userId,
          deletedAt: null,
        })
          .sort({ snapshotDate: -1 })
          .select('currentStreak longestStreak snapshotDate')
          .lean<MongoStreakSnapshotRecord>()

        return this._mapper.toDashboardStreakEntity(streak)
      },
      MongoDashboardErrorMapper.mapMongoError,
    )
  }

  async getTrackerOverview(
    userId: string,
  ): Promise<DashboardTrackerSummaryEntity> {
    return this.execute(
      'DASHBOARD_TRACKER_READ_FAILED',
      'Failed to read dashboard trackers',
      async () => {
        const [allTrackers, allProgress] = await Promise.all([
          Tracker.find({
            ownerId: userId,
            status: { $ne: 'archived' },
            deletedAt: null,
          })
            .select('_id title level updatedAt topicsCount')
            .sort({ updatedAt: -1 })
            .lean<MongoTrackerRecord[]>(),
          TrackerProgress.find({
            userId,
            deletedAt: null,
          })
            .select(
              'trackerId completionPercentage lastStudiedAt completedTopics',
            )
            .lean<MongoTrackerProgressRecord[]>(),
        ])

        const progressMap = new Map(
          allProgress.map((progress) => [
            this._mapper.toId(progress.trackerId),
            progress,
          ]),
        )

        const trackersWithProgress = allTrackers.map((tracker) =>
          this._mapper.toDashboardActiveTrackerEntity(
            tracker,
            progressMap.get(this._mapper.toId(tracker._id)),
          ),
        )

        return this._mapper.toDashboardTrackerSummaryEntity(
          trackersWithProgress,
        )
      },
      MongoDashboardErrorMapper.mapMongoError,
    )
  }

  async getAggregatedStats(userId: string): Promise<DashboardStatsEntity> {
    return this.execute(
      'DASHBOARD_STATS_READ_FAILED',
      'Failed to read dashboard statistics',
      async () => {
        const userObjectId = this.toObjectId(userId)

        const [progressAggregation, publishedTrackers, user] =
          await Promise.all([
            TrackerProgress.aggregate<MongoProgressAggregationRecord>([
              {
                $match: {
                  userId: userObjectId,
                  deletedAt: null,
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
            Tracker.countDocuments({
              ownerId: userId,
              visibility: 'public',
              deletedAt: null,
            }),
            User.findOne({
              _id: userId,
              deletedAt: null,
            })
              .select('coins')
              .lean<Pick<MongoUserRecord, 'coins'>>(),
          ])

        return this._mapper.toDashboardStatsEntity(
          progressAggregation[0],
          publishedTrackers,
          user,
        )
      },
      MongoDashboardErrorMapper.mapMongoError,
    )
  }

  async getRecentActivity(
    input: GetRecentActivityInput,
  ): Promise<DashboardRecentActivityEntity[]> {
    return this.execute(
      'DASHBOARD_ACTIVITY_READ_FAILED',
      'Failed to read recent dashboard activity',
      async () => {
        const {
          userId,
          limit = DASHBOARD_DEFAULT_RECENT_ACTIVITY_LIMIT,
        } = input

        const notifications = await Notification.find({
          userId,
          deletedAt: null,
        })
          .sort({ createdAt: -1 })
          .limit(this.safeLimit(limit, DASHBOARD_DEFAULT_RECENT_ACTIVITY_LIMIT))
          .select('type message createdAt')
          .lean<MongoNotificationRecord[]>()

        return notifications.map((notification) =>
          this._mapper.toDashboardRecentActivityEntity(notification),
        )
      },
      MongoDashboardErrorMapper.mapMongoError,
    )
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    return this.execute(
      'DASHBOARD_NOTIFICATION_READ_FAILED',
      'Failed to read dashboard notification count',
      async () =>
        Notification.countDocuments({
          userId,
          isRead: false,
          deletedAt: null,
        }),
      MongoDashboardErrorMapper.mapMongoError,
    )
  }

  async getActivityIntensity(
    input: GetActivityIntensityInput,
  ): Promise<DashboardActivityIntensityEntity[]> {
    return this.execute(
      'DASHBOARD_INTENSITY_READ_FAILED',
      'Failed to read dashboard activity intensity',
      async () => {
        const {
          userId,
          months = DASHBOARD_DEFAULT_ACTIVITY_MONTHS,
        } = input

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
          this._mapper.toDashboardActivityIntensityEntity(entry),
        )
      },
      MongoDashboardErrorMapper.mapMongoError,
    )
  }

  async getRecentBattles(
    input: GetRecentBattlesInput,
  ): Promise<DashboardBattleEntity[]> {
    return this.execute(
      'DASHBOARD_BATTLE_READ_FAILED',
      'Failed to read recent dashboard battles',
      async () => {
        const {
          userId,
          limit = DASHBOARD_DEFAULT_RECENT_BATTLES_LIMIT,
        } = input

        const battles = (await Battle.find({
          $or: [{ playerOneId: userId }, { playerTwoId: userId }],
          status: 'completed',
          deletedAt: null,
        })
          .sort({ endedAt: -1, updatedAt: -1 })
          .limit(this.safeLimit(limit, DASHBOARD_DEFAULT_RECENT_BATTLES_LIMIT))
          .select(
            '_id playerOneId playerTwoId winnerId playerOneScore playerTwoScore startedAt endedAt updatedAt',
          )
          .lean()) as MongoBattleRecord[]

        if (battles.length === 0) {
          return []
        }

        const opponentIds = battles.map((battle) =>
          this._mapper.getOpponentId(battle, userId),
        )

        const [opponents, opponentProfiles] = await Promise.all([
          User.find({
            _id: { $in: opponentIds },
            deletedAt: null,
          })
            .select('_id fullName username')
            .lean<MongoUserRecord[]>(),
          UserProfile.find({
            userId: { $in: opponentIds },
            deletedAt: null,
          })
            .select('userId avatarUrl')
            .lean<MongoUserProfileRecord[]>(),
        ])

        const opponentMap = new Map(
          opponents.map((opponent) => [
            this._mapper.toId(opponent._id),
            opponent,
          ]),
        )

        const profileMap = new Map(
          opponentProfiles.map((profile) => [
            this._mapper.toId(profile.userId),
            profile.avatarUrl ?? '',
          ]),
        )

        return battles.map((battle) =>
          this._mapper.toDashboardBattleEntity(
            battle,
            userId,
            opponentMap,
            profileMap,
          ),
        )
      },
      MongoDashboardErrorMapper.mapMongoError,
    )
  }

  async getFriendsHub(
    input: GetFriendsHubInput,
  ): Promise<DashboardFriendEntity[]> {
    return this.execute(
      'DASHBOARD_FRIEND_READ_FAILED',
      'Failed to read dashboard friends',
      async () => {
        const {
          userId,
          limit = DASHBOARD_DEFAULT_FRIENDS_LIMIT,
        } = input

        const friendships = (await Friend.find({
          $or: [{ userId }, { friendId: userId }],
          deletedAt: null,
        })
          .limit(this.safeLimit(limit, DASHBOARD_DEFAULT_FRIENDS_LIMIT))
          .lean()) as MongoFriendRecord[]

        if (friendships.length === 0) {
          return []
        }

        const friendIds = friendships.map((friendship) =>
          this._mapper.toId(friendship.userId) === userId
            ? this._mapper.toId(friendship.friendId)
            : this._mapper.toId(friendship.userId),
        )

        const [friends, friendProfiles] = await Promise.all([
          User.find({
            _id: { $in: friendIds },
            deletedAt: null,
          })
            .select('_id fullName username lastActiveAt')
            .lean<MongoUserRecord[]>(),
          UserProfile.find({
            userId: { $in: friendIds },
            deletedAt: null,
          })
            .select('userId avatarUrl')
            .lean<MongoUserProfileRecord[]>(),
        ])

        const profileMap = new Map(
          friendProfiles.map((profile) => [
            this._mapper.toId(profile.userId),
            profile.avatarUrl ?? '',
          ]),
        )

        return friends.map((friend) =>
          this._mapper.toDashboardFriendEntity(friend, profileMap),
        )
      },
      MongoDashboardErrorMapper.mapMongoError,
    )
  }

  async getRecommendationContext(
    userId: string,
  ): Promise<DashboardRecommendationContext> {
    return this.execute(
      'DASHBOARD_RECOMMENDATION_READ_FAILED',
      'Failed to read dashboard recommendation context',
      async () => {
        const [latestProgress, totalTrackers] = await Promise.all([
          TrackerProgress.findOne({
            userId,
            completionPercentage: { $lt: 100 },
            deletedAt: null,
          })
            .sort({ lastStudiedAt: -1 })
            .select('trackerId completionPercentage lastStudiedAt')
            .lean<MongoTrackerProgressRecord>(),
          Tracker.countDocuments({
            ownerId: userId,
            deletedAt: null,
          }),
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

        return this._mapper.toDashboardRecommendationContext(
          totalTrackers,
          latestProgress,
          tracker,
        )
      },
      MongoDashboardErrorMapper.mapMongoError,
    )
  }
}

export const mongoDashboardRepository = new MongoDashboardRepository()