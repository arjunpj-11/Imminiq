import { Types } from 'mongoose'

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
import { EarnedUserBadgeEntity } from '../../domain/entities/earned-user-badge.entity'
import { PublishedTrackerEntity } from '../../domain/entities/published-tracker.entity'
import { UserActivityEntity } from '../../domain/entities/user-activity.entity'
import { UserBadgeEntity } from '../../domain/entities/user-badge.entity'
import { UserPrivacySettingsEntity } from '../../domain/entities/user-privacy-settings.entity'
import { UserProfileEntity } from '../../domain/entities/user-profile.entity'
import { UserStreakDayEntity } from '../../domain/entities/user-streak-day.entity'
import { UserStreakSnapshotEntity } from '../../domain/entities/user-streak-snapshot.entity'
import { UserEntity } from '../../domain/entities/user.entity'
import { UsersDomainError } from '../../domain/errors/users-domain.error'
import type { UsersRepositoryContract } from '../../domain/repositories/users.repository.interface'
import type { BadgeType } from '../../domain/value-objects/badge-type.vo'
import type { PublishedTrackerQuery } from '../../domain/value-objects/published-tracker-query.vo'
import type { RelationshipState } from '../../domain/value-objects/relationship-state.vo'
import type { StreakIntensity } from '../../domain/value-objects/streak-intensity.vo'
import type { UserIdInput } from '../../domain/value-objects/user-id.vo'
import type { UserProfileUpdate } from '../../domain/value-objects/user-profile-update.vo'

const activeOnly = { deletedAt: null }

type MongoIdLike = {
  toString(): string
}

type MongoUserRecord = {
  _id: MongoIdLike
  fullName?: string | null
  username?: string | null
  email?: string | null
  role?: string | null
  status?: string | null
  emailVerified?: boolean | null
  phoneVerified?: boolean | null
  onboardingCompleted?: boolean | null
  coins?: number | null
  xp?: number | null
  level?: number | null
  streakCount?: number | null
  avatarUrl?: string | null
  provider?: string | null
  referralCode?: string | null
  createdAt?: Date
  updatedAt?: Date
}

type MongoProfileRecord = {
  _id?: MongoIdLike | null
  userId?: MongoIdLike | null
  fullName?: string | null
  headline?: string | null
  bio?: string | null
  location?: string | null
  education?: string | null
  skills?: string[] | null
  interests?: string[] | null
  githubUrl?: string | null
  linkedinUrl?: string | null
  portfolioUrl?: string | null
  profileBannerUrl?: string | null
  publicProfileEnabled?: boolean | null
  publishedCount?: number | null
  cloneCount?: number | null
  ratingAverage?: number | null
  likeCount?: number | null
}

type MongoPrivacySettingsRecord = {
  privacyShowProfile?: boolean | null
  privacyShowStats?: boolean | null
  privacyShowTrackers?: boolean | null
  privacyShowActivity?: boolean | null
}

type MongoStreakSnapshotRecord = {
  currentStreak?: number | null
  longestStreak?: number | null
  totalActiveDays?: number | null
  totalFreezeUsed?: number | null
}

type MongoStreakHistoryRecord = {
  date?: Date | string | null
  activityCount?: number | null
  intensityLevel?: StreakIntensity | null
  streakDay?: number | null
  isFrozen?: boolean | null
}

type MongoBadgeRecord = {
  _id: MongoIdLike
  name?: string | null
  description?: string | null
  iconUrl?: string | null
  badgeType?: BadgeType | null
  criteria?: Record<string, unknown> | null
}

type MongoEarnedBadgeRecord = {
  badgeId?: MongoBadgeRecord | MongoIdLike | null
  earnedAt?: Date | string | null
}

type MongoActivityRecord = {
  _id: MongoIdLike
  action?: string | null
  module?: string | null
  metadata?: Record<string, unknown> | null
  createdAt?: Date | null
}

type MongoTrackerRecord = {
  _id: MongoIdLike
  title?: string | null
  slug?: string | null
  description?: string | null
  category?: string | null
  field?: string | null
  goal?: string | null
  level?: string | null
  timeline?: string | null
  coverImageUrl?: string | null
  topicsCount?: number | null
  subtopicsCount?: number | null
  cloneCount?: number | null
  likeCount?: number | null
  saveCount?: number | null
  progressPercent?: number | null
  ratingAverage?: number | null
  ratingCount?: number | null
  publishedAt?: Date | null
  createdAt?: Date
}

export class MongoUsersRepository implements UsersRepositoryContract {
  async findById(userId: string): Promise<UserEntity | null> {
    return this.executePersistence(async () => {
      const user = await User.findOne({ _id: userId, ...activeOnly })
        .select(
          '_id fullName username email role status emailVerified phoneVerified onboardingCompleted coins xp level streakCount avatarUrl provider referralCode createdAt updatedAt lastActiveAt',
        )
        .lean<MongoUserRecord>()

      return user ? this.toUserEntity(user) : null
    })
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    return this.executePersistence(async () => {
      const user = await User.findOne({ username, ...activeOnly })
        .select(
          '_id fullName username email role status emailVerified phoneVerified onboardingCompleted coins xp level streakCount avatarUrl provider referralCode createdAt updatedAt lastActiveAt',
        )
        .lean<MongoUserRecord>()

      return user ? this.toUserEntity(user) : null
    })
  }

  async updateFullName(
    userId: string,
    fullName: string,
  ): Promise<UserEntity | null> {
    return this.executePersistence(async () => {
      const user = await User.findOneAndUpdate(
        { _id: userId, deletedAt: null },
        { $set: { fullName: fullName.trim() } },
        { returnDocument: 'after' },
      )
        .select(
          '_id fullName username email role status emailVerified phoneVerified onboardingCompleted coins xp level streakCount avatarUrl provider referralCode createdAt updatedAt lastActiveAt',
        )
        .lean<MongoUserRecord>()

      return user ? this.toUserEntity(user) : null
    })
  }

  async findByUserId(
    userId: UserIdInput,
  ): Promise<UserProfileEntity | null> {
    return this.executePersistence(async () => {
      const profile = await UserProfile.findOne({
        userId: this.toObjectId(userId),
        ...activeOnly,
      }).lean<MongoProfileRecord>()

      return profile ? this.toUserProfileEntity(profile, userId) : null
    })
  }

  async findPrivacySettings(
    userId: UserIdInput,
  ): Promise<UserPrivacySettingsEntity | null> {
    return this.executePersistence(async () => {
      const settings = await UserSettings.findOne({
        userId: this.toObjectId(userId),
        ...activeOnly,
      }).lean<MongoPrivacySettingsRecord>()

      return settings ? this.toPrivacySettingsEntity(settings) : null
    })
  }

  async ensureForUser(
    userId: UserIdInput,
    fallbackName = '',
  ): Promise<UserProfileEntity> {
    return this.executePersistence(async () => {
      const id = this.toObjectId(userId)
      const existing = await UserProfile.findOne({
        userId: id,
        ...activeOnly,
      }).lean<MongoProfileRecord>()

      if (existing) {
        return this.toUserProfileEntity(existing, userId)
      }

      const created = await UserProfile.create({
        userId: id,
        fullName: fallbackName.trim(),
      })

      return this.toUserProfileEntity(
        created.toObject() as MongoProfileRecord,
        userId,
      )
    })
  }

  async updateByUserId(
    userId: UserIdInput,
    payload: UserProfileUpdate,
  ): Promise<UserProfileEntity | null> {
    return this.executePersistence(async () => {
      const id = this.toObjectId(userId)

      await this.ensureForUser(id)

      const profile = await UserProfile.findOneAndUpdate(
        { userId: id, ...activeOnly },
        { $set: this.toProfileUpdateData(payload) },
        { returnDocument: 'after', runValidators: true },
      ).lean<MongoProfileRecord>()

      return profile ? this.toUserProfileEntity(profile, userId) : null
    })
  }

  async findActivityFeed(
    userId: UserIdInput,
    page = 1,
    limit = 10,
  ): Promise<{ items: UserActivityEntity[]; total: number }> {
    return this.executePersistence(async () => {
      const skip = (page - 1) * limit
      const filter = {
        userId: this.toObjectId(userId),
        severity: 'info',
        ...activeOnly,
      }

      const [items, total] = await Promise.all([
        ActivityLog.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean<MongoActivityRecord[]>(),
        ActivityLog.countDocuments(filter),
      ])

      return {
        items: items.map((item) => this.toUserActivityEntity(item)),
        total,
      }
    })
  }

  async findRecentActivity(
    userId: UserIdInput,
    limit = 10,
  ): Promise<UserActivityEntity[]> {
    return this.executePersistence(async () => {
      const items = await ActivityLog.find({
        userId: this.toObjectId(userId),
        severity: 'info',
        ...activeOnly,
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean<MongoActivityRecord[]>()

      return items.map((item) => this.toUserActivityEntity(item))
    })
  }

  async findBadgeShowcase(userId: UserIdInput): Promise<{
    catalog: UserBadgeEntity[]
    earned: EarnedUserBadgeEntity[]
  }> {
    return this.executePersistence(async () => {
      const id = this.toObjectId(userId)
      const [catalog, earned] = await Promise.all([
        Badge.find(activeOnly)
          .sort({ createdAt: 1 })
          .lean<MongoBadgeRecord[]>(),
        UserBadge.find({ userId: id, ...activeOnly })
          .populate('badgeId')
          .lean<MongoEarnedBadgeRecord[]>(),
      ])

      return {
        catalog: catalog.map((badge) => this.toUserBadgeEntity(badge)),
        earned: earned.map((item) => this.toEarnedUserBadgeEntity(item)),
      }
    })
  }

  async findEarnedBadgesPaginated(
    userId: UserIdInput,
    page = 1,
    limit = 10,
  ): Promise<{ items: EarnedUserBadgeEntity[]; total: number }> {
    return this.executePersistence(async () => {
      const skip = (page - 1) * limit
      const filter = { userId: this.toObjectId(userId), ...activeOnly }
      const [items, total] = await Promise.all([
        UserBadge.find(filter)
          .populate('badgeId')
          .sort({ earnedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean<MongoEarnedBadgeRecord[]>(),
        UserBadge.countDocuments(filter),
      ])

      return {
        items: items.map((item) => this.toEarnedUserBadgeEntity(item)),
        total,
      }
    })
  }

  async findLatestSnapshot(
    userId: UserIdInput,
  ): Promise<UserStreakSnapshotEntity | null> {
    return this.executePersistence(async () => {
      const snapshot = await StreakSnapshot.findOne({
        userId: this.toObjectId(userId),
        ...activeOnly,
      })
        .sort({ snapshotDate: -1 })
        .lean<MongoStreakSnapshotRecord>()

      return snapshot ? this.toStreakSnapshotEntity(snapshot) : null
    })
  }

  async findHistoryByYear(
    userId: UserIdInput,
    year: number,
  ): Promise<UserStreakDayEntity[]> {
    return this.executePersistence(async () => {
      const start = new Date(Date.UTC(year, 0, 1, 0, 0, 0))
      const end = new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0))
      const history = await StreakHistory.find({
        userId: this.toObjectId(userId),
        date: { $gte: start, $lt: end },
        ...activeOnly,
      })
        .sort({ date: 1 })
        .lean<MongoStreakHistoryRecord[]>()

      return history.map((day) => this.toStreakDayEntity(day))
    })
  }

  async findPublishedTrackers(
    ownerId: UserIdInput,
    query: PublishedTrackerQuery,
    includePrivate = false,
  ): Promise<{ items: PublishedTrackerEntity[]; total: number }> {
    return this.executePersistence(async () => {
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
        const safeSearch = this.escapeRegex(query.search)
        filter.$or = [
          { title: { $regex: safeSearch, $options: 'i' } },
          { description: { $regex: safeSearch, $options: 'i' } },
          { category: { $regex: safeSearch, $options: 'i' } },
        ]
      }

      const [items, total] = await Promise.all([
        Tracker.find(filter)
          .sort(this.buildTrackerSort(query.sort))
          .skip(skip)
          .limit(query.limit)
          .lean<MongoTrackerRecord[]>(),
        Tracker.countDocuments(filter),
      ])

      return {
        items: items.map((item) => this.toPublishedTrackerEntity(item)),
        total,
      }
    })
  }

  async getRelationshipState(
    viewerUserId: string | undefined,
    targetUserId: UserIdInput,
  ): Promise<RelationshipState> {
    return this.executePersistence(async () => {
      if (!viewerUserId) return 'not_connected'

      const viewerId = this.toObjectId(viewerUserId)
      const targetId = this.toObjectId(targetUserId)

      if (viewerId.equals(targetId)) return 'self'

      const friendship = await Friend.findOne({
        userId: viewerId,
        friendId: targetId,
        status: 'active',
        ...activeOnly,
      }).lean()

      if (friendship) return 'friends'

      const outgoing = await FriendRequest.findOne({
        senderId: viewerId,
        receiverId: targetId,
        status: 'pending',
        ...activeOnly,
      }).lean()

      if (outgoing) return 'request_sent'

      const incoming = await FriendRequest.findOne({
        senderId: targetId,
        receiverId: viewerId,
        status: 'pending',
        ...activeOnly,
      }).lean()

      return incoming ? 'request_received' : 'not_connected'
    })
  }

  private async executePersistence<T>(
    operation: () => Promise<T>,
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      if (error instanceof UsersDomainError) {
        throw error
      }

      throw new UsersDomainError(
        'PERSISTENCE_ERROR',
        'Users persistence operation failed',
      )
    }
  }

  private toUserEntity(user: MongoUserRecord): UserEntity {
    return new UserEntity({
      id: user._id.toString(),
      fullName: user.fullName ?? '',
      username: user.username ?? '',
      ...(user.email ? { email: user.email } : {}),
      role: user.role ?? 'user',
      status: user.status ?? 'active',
      emailVerified: Boolean(user.emailVerified),
      phoneVerified: Boolean(user.phoneVerified),
      onboardingCompleted: Boolean(user.onboardingCompleted),
      coins: Number(user.coins ?? 0),
      xp: Number(user.xp ?? 0),
      level: Number(user.level ?? 0),
      streakCount: Number(user.streakCount ?? 0),
      avatarUrl: user.avatarUrl ?? '',
      provider: user.provider ?? 'email',
      referralCode: user.referralCode ?? '',
      ...(user.createdAt ? { createdAt: user.createdAt } : {}),
      ...(user.updatedAt ? { updatedAt: user.updatedAt } : {}),
    })
  }

  private toUserProfileEntity(
    profile: MongoProfileRecord,
    fallbackUserId: UserIdInput,
  ): UserProfileEntity {
    return new UserProfileEntity({
      ...(profile._id ? { id: profile._id.toString() } : {}),
      userId: profile.userId?.toString() ?? fallbackUserId.toString(),
      fullName: profile.fullName ?? '',
      headline: profile.headline ?? '',
      bio: profile.bio ?? '',
      location: profile.location ?? '',
      education: profile.education ?? '',
      skills: Array.isArray(profile.skills) ? profile.skills : [],
      interests: Array.isArray(profile.interests) ? profile.interests : [],
      githubUrl: profile.githubUrl ?? '',
      linkedinUrl: profile.linkedinUrl ?? '',
      portfolioUrl: profile.portfolioUrl ?? '',
      profileBannerUrl: profile.profileBannerUrl ?? '',
      publicProfileEnabled: profile.publicProfileEnabled ?? true,
      publishedCount: Number(profile.publishedCount ?? 0),
      cloneCount: Number(profile.cloneCount ?? 0),
      ratingAverage: Number(profile.ratingAverage ?? 0),
      likeCount: Number(profile.likeCount ?? 0),
    })
  }

  private toPrivacySettingsEntity(
    settings: MongoPrivacySettingsRecord,
  ): UserPrivacySettingsEntity {
    return new UserPrivacySettingsEntity({
      showProfile: settings.privacyShowProfile ?? true,
      showStats: settings.privacyShowStats ?? true,
      showTrackers: settings.privacyShowTrackers ?? true,
      showActivity: settings.privacyShowActivity ?? true,
    })
  }

  private toUserActivityEntity(
    activity: MongoActivityRecord,
  ): UserActivityEntity {
    if (!activity.createdAt) {
      throw new UsersDomainError(
        'MAPPING_FAILED',
        'User activity is missing its creation date',
      )
    }

    return new UserActivityEntity({
      id: activity._id.toString(),
      action: activity.action ?? '',
      module: activity.module ?? '',
      metadata: this.isRecord(activity.metadata) ? activity.metadata : {},
      createdAt: activity.createdAt,
    })
  }

  private toUserBadgeEntity(badge: MongoBadgeRecord): UserBadgeEntity {
    if (!badge.badgeType) {
      throw new UsersDomainError(
        'MAPPING_FAILED',
        'User badge is missing its badge type',
      )
    }

    return new UserBadgeEntity({
      id: badge._id.toString(),
      name: badge.name ?? '',
      description: badge.description ?? '',
      iconUrl: badge.iconUrl ?? '',
      badgeType: badge.badgeType,
      criteria: this.isRecord(badge.criteria) ? badge.criteria : {},
    })
  }

  private toEarnedUserBadgeEntity(
    earnedBadge: MongoEarnedBadgeRecord,
  ): EarnedUserBadgeEntity {
    if (!this.isMongoBadgeRecord(earnedBadge.badgeId)) {
      throw new UsersDomainError(
        'MAPPING_FAILED',
        'Earned badge details were not populated',
      )
    }

    return new EarnedUserBadgeEntity({
      badge: this.toUserBadgeEntity(earnedBadge.badgeId),
      ...(earnedBadge.earnedAt !== undefined
        ? { earnedAt: earnedBadge.earnedAt }
        : {}),
    })
  }

  private toStreakSnapshotEntity(
    snapshot: MongoStreakSnapshotRecord,
  ): UserStreakSnapshotEntity {
    return new UserStreakSnapshotEntity({
      currentStreak: Number(snapshot.currentStreak ?? 0),
      longestStreak: Number(snapshot.longestStreak ?? 0),
      totalActiveDays: Number(snapshot.totalActiveDays ?? 0),
      totalFreezeUsed: Number(snapshot.totalFreezeUsed ?? 0),
    })
  }

  private toStreakDayEntity(
    day: MongoStreakHistoryRecord,
  ): UserStreakDayEntity {
    if (!day.date) {
      throw new UsersDomainError(
        'MAPPING_FAILED',
        'Streak history is missing its date',
      )
    }

    return new UserStreakDayEntity({
      date: day.date,
      activityCount: Number(day.activityCount ?? 0),
      intensityLevel: day.intensityLevel ?? 'none',
      streakDay: Number(day.streakDay ?? 0),
      isFrozen: Boolean(day.isFrozen),
    })
  }

  private toPublishedTrackerEntity(
    tracker: MongoTrackerRecord,
  ): PublishedTrackerEntity {
    return new PublishedTrackerEntity({
      id: tracker._id.toString(),
      title: tracker.title ?? '',
      slug: tracker.slug ?? '',
      description: tracker.description ?? '',
      ...(tracker.category ? { category: tracker.category } : {}),
      ...(tracker.field ? { field: tracker.field } : {}),
      ...(tracker.goal ? { goal: tracker.goal } : {}),
      ...(tracker.level ? { level: tracker.level } : {}),
      ...(tracker.timeline ? { timeline: tracker.timeline } : {}),
      ...(tracker.coverImageUrl
        ? { coverImageUrl: tracker.coverImageUrl }
        : {}),
      topicsCount: Number(tracker.topicsCount ?? 0),
      subtopicsCount: Number(tracker.subtopicsCount ?? 0),
      cloneCount: Number(tracker.cloneCount ?? 0),
      likeCount: Number(tracker.likeCount ?? 0),
      saveCount: Number(tracker.saveCount ?? 0),
      progressPercent: Number(tracker.progressPercent ?? 0),
      ratingAverage: Number(tracker.ratingAverage ?? 0),
      ratingCount: Number(tracker.ratingCount ?? 0),
      publishedAt: tracker.publishedAt ?? null,
      ...(tracker.createdAt ? { createdAt: tracker.createdAt } : {}),
    })
  }

  private toProfileUpdateData(
    payload: UserProfileUpdate,
  ): Record<string, unknown> {
    return {
      ...(payload.fullName !== undefined
        ? { fullName: payload.fullName.trim() }
        : {}),
      ...(payload.headline !== undefined
        ? { headline: payload.headline.trim() }
        : {}),
      ...(payload.bio !== undefined ? { bio: payload.bio.trim() } : {}),
      ...(payload.location !== undefined
        ? { location: payload.location.trim() }
        : {}),
      ...(payload.education !== undefined
        ? { education: payload.education.trim() }
        : {}),
      ...(payload.skills !== undefined ? { skills: payload.skills } : {}),
      ...(payload.interests !== undefined
        ? { interests: payload.interests }
        : {}),
      ...(payload.githubUrl !== undefined
        ? { githubUrl: payload.githubUrl.trim() }
        : {}),
      ...(payload.linkedinUrl !== undefined
        ? { linkedinUrl: payload.linkedinUrl.trim() }
        : {}),
      ...(payload.portfolioUrl !== undefined
        ? { portfolioUrl: payload.portfolioUrl.trim() }
        : {}),
      ...(payload.publicProfileEnabled !== undefined
        ? { publicProfileEnabled: payload.publicProfileEnabled }
        : {}),
    }
  }

  private toObjectId(id: UserIdInput): Types.ObjectId {
    return new Types.ObjectId(id.toString())
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  private buildTrackerSort(
    sortBy: PublishedTrackerQuery['sort'],
  ): Record<string, 1 | -1> {
    if (sortBy === 'createdAt') return { createdAt: -1 }
    if (sortBy === 'ratingAverage') {
      return { ratingAverage: -1, createdAt: -1 }
    }
    if (sortBy === 'cloneCount') {
      return { cloneCount: -1, createdAt: -1 }
    }

    return { publishedAt: -1, createdAt: -1 }
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
  }

  private isMongoBadgeRecord(value: unknown): value is MongoBadgeRecord {
    return this.isRecord(value) && '_id' in value
  }
}

export const mongoUsersRepository = new MongoUsersRepository()
