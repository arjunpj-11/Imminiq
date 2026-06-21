import { ActivityLog } from '../../../../infrastructure/database/models/activity-log.model'
import { Badge } from '../../../../infrastructure/database/models/badge.model'
import { Friend } from '../../../../infrastructure/database/models/friend.model'
import { FriendRequest } from '../../../../infrastructure/database/models/friend-request.model'
import { StreakHistory } from '../../../../infrastructure/database/models/streak-history.model'
import { StreakSnapshot } from '../../../../infrastructure/database/models/streak-snapshot.model'
import { Tracker } from '../../../../infrastructure/database/models/tracker.model'
import { User } from '../../../../infrastructure/database/models/user.model'
import { UserBadge } from '../../../../infrastructure/database/models/user-badge.model'
import { UserProfile } from '../../../../infrastructure/database/models/user-profile.model'
import { UserSettings } from '../../../../infrastructure/database/models/user-settings.model'
import type { EarnedUserBadgeEntity } from '../../domain/entities/earned-user-badge.entity'
import type { PublishedTrackerEntity } from '../../domain/entities/published-tracker.entity'
import type { UserActivityEntity } from '../../domain/entities/user-activity.entity'
import type { UserBadgeEntity } from '../../domain/entities/user-badge.entity'
import type { UserPrivacySettingsEntity } from '../../domain/entities/user-privacy-settings.entity'
import type { UserProfileEntity } from '../../domain/entities/user-profile.entity'
import type { UserStreakDayEntity } from '../../domain/entities/user-streak-day.entity'
import type { UserStreakSnapshotEntity } from '../../domain/entities/user-streak-snapshot.entity'
import type { UserEntity } from '../../domain/entities/user.entity'
import type {
  EnsureUserProfileInput,
  FindEarnedUserBadgesPaginatedInput,
  FindPublishedTrackersInput,
  FindRecentUserActivityInput,
  FindUserActivityFeedInput,
  FindUserStreakHistoryByYearInput,
  GetRelationshipStateInput,
  UpdateUserFullNameInput,
  UpdateUserProfileInput,
  UsersRepositoryContract,
} from '../../domain/repositories/users.repository.interface'
import type { RelationshipState } from '../../domain/value-objects/relationship-state.vo'
import type { UserIdInput } from '../../domain/value-objects/user-id.vo'
import { MongoUsersBaseRepository } from './mongo-users-base.repository'
import { MongoUsersErrorMapper } from './mongo-users-error.mapper'
import { MongoUsersMapper } from './mongo-users.mapper'
import type {
  MongoActivityRecord,
  MongoBadgeRecord,
  MongoEarnedBadgeRecord,
  MongoPrivacySettingsRecord,
  MongoProfileRecord,
  MongoStreakHistoryRecord,
  MongoStreakSnapshotRecord,
  MongoTrackerRecord,
  MongoUserRecord,
} from './mongo-users.types'

const activeOnly = {
  deletedAt: null,
}

const USER_SELECT =
  '_id fullName username email role status emailVerified phoneVerified onboardingCompleted coins xp level streakCount avatarUrl provider referralCode createdAt updatedAt lastActiveAt'

export class MongoUsersRepository
  extends MongoUsersBaseRepository
  implements UsersRepositoryContract
{
  constructor(private readonly mapper = new MongoUsersMapper()) {
    super()
  }

  async findById(userId: string): Promise<UserEntity | null> {
    return this.execute(
      'USER_READ_FAILED',
      'Failed to read user',
      async () => {
        const user = await User.findOne({
          _id: userId,
          ...activeOnly,
        })
          .select(USER_SELECT)
          .lean<MongoUserRecord>()

        return user ? this.mapper.toUserEntity(user) : null
      },
    )
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    return this.execute(
      'USER_READ_FAILED',
      'Failed to read user by username',
      async () => {
        const user = await User.findOne({
          username,
          ...activeOnly,
        })
          .select(USER_SELECT)
          .lean<MongoUserRecord>()

        return user ? this.mapper.toUserEntity(user) : null
      },
    )
  }

  async updateFullName(
    input: UpdateUserFullNameInput,
  ): Promise<UserEntity | null> {
    return this.execute(
      'USER_UPDATE_FAILED',
      'Failed to update user full name',
      async () => {
        const user = await User.findOneAndUpdate(
          {
            _id: input.userId,
            deletedAt: null,
          },
          {
            $set: {
              fullName: input.fullName.trim(),
            },
          },
          {
            returnDocument: 'after',
          },
        )
          .select(USER_SELECT)
          .lean<MongoUserRecord>()

        return user ? this.mapper.toUserEntity(user) : null
      },
      MongoUsersErrorMapper.mapDuplicateUserRecordError,
    )
  }

  async findByUserId(
    userId: UserIdInput,
  ): Promise<UserProfileEntity | null> {
    return this.execute(
      'USER_PROFILE_READ_FAILED',
      'Failed to read user profile',
      async () => {
        const profile = await UserProfile.findOne({
          userId: this.toObjectId(userId),
          ...activeOnly,
        }).lean<MongoProfileRecord>()

        return profile
          ? this.mapper.toUserProfileEntity(profile, userId)
          : null
      },
    )
  }

  async findPrivacySettings(
    userId: UserIdInput,
  ): Promise<UserPrivacySettingsEntity | null> {
    return this.execute(
      'USER_PRIVACY_READ_FAILED',
      'Failed to read user privacy settings',
      async () => {
        const settings = await UserSettings.findOne({
          userId: this.toObjectId(userId),
          ...activeOnly,
        }).lean<MongoPrivacySettingsRecord>()

        return settings ? this.mapper.toPrivacySettingsEntity(settings) : null
      },
    )
  }

  async ensureForUser(
    input: EnsureUserProfileInput,
  ): Promise<UserProfileEntity> {
    return this.execute(
      'USER_PROFILE_CREATE_FAILED',
      'Failed to ensure user profile',
      async () => {
        const id = this.toObjectId(input.userId)

        const existing = await UserProfile.findOne({
          userId: id,
          ...activeOnly,
        }).lean<MongoProfileRecord>()

        if (existing) {
          return this.mapper.toUserProfileEntity(existing, input.userId)
        }

        const created = await UserProfile.create({
          userId: id,
          fullName: input.fallbackName?.trim() ?? '',
        })

        return this.mapper.toUserProfileEntity(
          created.toObject() as MongoProfileRecord,
          input.userId,
        )
      },
      MongoUsersErrorMapper.mapDuplicateUserRecordError,
    )
  }

  async updateByUserId(
    input: UpdateUserProfileInput,
  ): Promise<UserProfileEntity | null> {
    return this.execute(
      'USER_PROFILE_UPDATE_FAILED',
      'Failed to update user profile',
      async () => {
        const id = this.toObjectId(input.userId)

        await this.ensureForUser({
          userId: input.userId,
        })

        const profile = await UserProfile.findOneAndUpdate(
          {
            userId: id,
            ...activeOnly,
          },
          {
            $set: this.mapper.toProfileUpdateData(input.payload),
          },
          {
            returnDocument: 'after',
            runValidators: true,
          },
        ).lean<MongoProfileRecord>()

        return profile
          ? this.mapper.toUserProfileEntity(profile, input.userId)
          : null
      },
      MongoUsersErrorMapper.mapDuplicateUserRecordError,
    )
  }

  async findActivityFeed(
    input: FindUserActivityFeedInput,
  ): Promise<{ items: UserActivityEntity[]; total: number }> {
    return this.execute(
      'USER_ACTIVITY_READ_FAILED',
      'Failed to read user activity feed',
      async () => {
        const { userId, page = 1, limit = 10 } = input
        const skip = (page - 1) * limit

        const filter = {
          userId: this.toObjectId(userId),
          severity: 'info',
          ...activeOnly,
        }

        const [items, total] = await Promise.all([
          ActivityLog.find(filter)
            .sort({
              createdAt: -1,
            })
            .skip(skip)
            .limit(limit)
            .lean<MongoActivityRecord[]>(),
          ActivityLog.countDocuments(filter),
        ])

        return {
          items: items.map((item) => this.mapper.toUserActivityEntity(item)),
          total,
        }
      },
    )
  }

  async findRecentActivity(
    input: FindRecentUserActivityInput,
  ): Promise<UserActivityEntity[]> {
    return this.execute(
      'USER_ACTIVITY_READ_FAILED',
      'Failed to read recent user activity',
      async () => {
        const { userId, limit = 10 } = input

        const items = await ActivityLog.find({
          userId: this.toObjectId(userId),
          severity: 'info',
          ...activeOnly,
        })
          .sort({
            createdAt: -1,
          })
          .limit(limit)
          .lean<MongoActivityRecord[]>()

        return items.map((item) => this.mapper.toUserActivityEntity(item))
      },
    )
  }

  async findBadgeShowcase(userId: UserIdInput): Promise<{
    catalog: UserBadgeEntity[]
    earned: EarnedUserBadgeEntity[]
  }> {
    return this.execute(
      'USER_BADGE_READ_FAILED',
      'Failed to read user badge showcase',
      async () => {
        const id = this.toObjectId(userId)

        const [catalog, earned] = await Promise.all([
          Badge.find(activeOnly)
            .sort({
              createdAt: 1,
            })
            .lean<MongoBadgeRecord[]>(),
          UserBadge.find({
            userId: id,
            ...activeOnly,
          })
            .populate('badgeId')
            .lean<MongoEarnedBadgeRecord[]>(),
        ])

        return {
          catalog: catalog.map((badge) =>
            this.mapper.toUserBadgeEntity(badge),
          ),
          earned: earned.map((item) =>
            this.mapper.toEarnedUserBadgeEntity(item),
          ),
        }
      },
    )
  }

  async findEarnedBadgesPaginated(
    input: FindEarnedUserBadgesPaginatedInput,
  ): Promise<{ items: EarnedUserBadgeEntity[]; total: number }> {
    return this.execute(
      'USER_BADGE_READ_FAILED',
      'Failed to read earned user badges',
      async () => {
        const { userId, page = 1, limit = 10 } = input
        const skip = (page - 1) * limit

        const filter = {
          userId: this.toObjectId(userId),
          ...activeOnly,
        }

        const [items, total] = await Promise.all([
          UserBadge.find(filter)
            .populate('badgeId')
            .sort({
              earnedAt: -1,
            })
            .skip(skip)
            .limit(limit)
            .lean<MongoEarnedBadgeRecord[]>(),
          UserBadge.countDocuments(filter),
        ])

        return {
          items: items.map((item) =>
            this.mapper.toEarnedUserBadgeEntity(item),
          ),
          total,
        }
      },
    )
  }

  async findLatestSnapshot(
    userId: UserIdInput,
  ): Promise<UserStreakSnapshotEntity | null> {
    return this.execute(
      'USER_STREAK_READ_FAILED',
      'Failed to read latest user streak snapshot',
      async () => {
        const snapshot = await StreakSnapshot.findOne({
          userId: this.toObjectId(userId),
          ...activeOnly,
        })
          .sort({
            snapshotDate: -1,
          })
          .lean<MongoStreakSnapshotRecord>()

        return snapshot ? this.mapper.toStreakSnapshotEntity(snapshot) : null
      },
    )
  }

  async findHistoryByYear(
    input: FindUserStreakHistoryByYearInput,
  ): Promise<UserStreakDayEntity[]> {
    return this.execute(
      'USER_STREAK_READ_FAILED',
      'Failed to read user streak history',
      async () => {
        const start = new Date(Date.UTC(input.year, 0, 1, 0, 0, 0))
        const end = new Date(Date.UTC(input.year + 1, 0, 1, 0, 0, 0))

        const history = await StreakHistory.find({
          userId: this.toObjectId(input.userId),
          date: {
            $gte: start,
            $lt: end,
          },
          ...activeOnly,
        })
          .sort({
            date: 1,
          })
          .lean<MongoStreakHistoryRecord[]>()

        return history.map((day) => this.mapper.toStreakDayEntity(day))
      },
    )
  }

  async findPublishedTrackers(
    input: FindPublishedTrackersInput,
  ): Promise<{ items: PublishedTrackerEntity[]; total: number }> {
    return this.execute(
      'USER_PUBLISHED_TRACKER_READ_FAILED',
      'Failed to read published trackers',
      async () => {
        const { ownerId, query, includePrivate = false } = input
        const skip = (query.page - 1) * query.limit

        const filter: Record<string, unknown> = {
          ownerId: this.toObjectId(ownerId),
          deletedAt: null,
          status: query.status ?? 'active',
        }

        if (!includePrivate) {
          filter.visibility = 'public'
        }

        if (query.search) {
          const safeSearch = this.mapper.escapeRegex(query.search)

          filter.$or = [
            {
              title: {
                $regex: safeSearch,
                $options: 'i',
              },
            },
            {
              description: {
                $regex: safeSearch,
                $options: 'i',
              },
            },
            {
              category: {
                $regex: safeSearch,
                $options: 'i',
              },
            },
          ]
        }

        const [items, total] = await Promise.all([
          Tracker.find(filter)
            .sort(this.mapper.buildTrackerSort(query.sort))
            .skip(skip)
            .limit(query.limit)
            .lean<MongoTrackerRecord[]>(),
          Tracker.countDocuments(filter),
        ])

        return {
          items: items.map((item) =>
            this.mapper.toPublishedTrackerEntity(item),
          ),
          total,
        }
      },
    )
  }

  async getRelationshipState(
    input: GetRelationshipStateInput,
  ): Promise<RelationshipState> {
    return this.execute(
      'USER_RELATIONSHIP_READ_FAILED',
      'Failed to read user relationship state',
      async () => {
        if (!input.viewerUserId) {
          return 'not_connected'
        }

        const viewerId = this.toObjectId(input.viewerUserId)
        const targetId = this.toObjectId(input.targetUserId)

        if (viewerId.equals(targetId)) {
          return 'self'
        }

        const friendship = await Friend.findOne({
          userId: viewerId,
          friendId: targetId,
          status: 'active',
          ...activeOnly,
        }).lean()

        if (friendship) {
          return 'friends'
        }

        const outgoing = await FriendRequest.findOne({
          senderId: viewerId,
          receiverId: targetId,
          status: 'pending',
          ...activeOnly,
        }).lean()

        if (outgoing) {
          return 'request_sent'
        }

        const incoming = await FriendRequest.findOne({
          senderId: targetId,
          receiverId: viewerId,
          status: 'pending',
          ...activeOnly,
        }).lean()

        return incoming ? 'request_received' : 'not_connected'
      },
    )
  }
}

export const mongoUsersRepository = new MongoUsersRepository()