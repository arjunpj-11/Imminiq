import { Types } from 'mongoose'
import { User } from '../../../../infrastructure/database/models/user.model'
import { UserProfile } from '../../../../infrastructure/database/models/user-profile.model'
import { UserSettings } from '../../../../infrastructure/database/models/user-settings.model'
import { StreakHistory } from '../../../../infrastructure/database/models/streak-history.model'
import { StreakSnapshot } from '../../../../infrastructure/database/models/streak-snapshot.model'
import { Badge } from '../../../../infrastructure/database/models/badge.model'
import { UserBadge } from '../../../../infrastructure/database/models/user-badge.model'
import { ActivityLog } from '../../../../infrastructure/database/models/activity-log.model'
import { Friend } from '../../../../infrastructure/database/models/friend.model'
import { FriendRequest } from '../../../../infrastructure/database/models/friend-request.model'
import { Tracker } from '../../../../infrastructure/database/models/tracker.model'

import type { UsersRepository } from '../../domain/repositories/users.repository.interface'
import type {
  PaginationQuery,
  RelationshipState,
  UpdateMyProfileInput,
} from '../../domain/types/users.types'

const activeOnly = { deletedAt: null }

const toObjectId = (id: string | Types.ObjectId) =>
  typeof id === 'string' ? new Types.ObjectId(id) : id

export const mongoUsersRepository: UsersRepository = {
  findUserById(userId: string) {
    return User.findOne({
      _id: userId,
      ...activeOnly,
    })
      .select(
        '_id fullName username email role status emailVerified phoneVerified onboardingCompleted coins xp level streakCount avatarUrl provider referralCode createdAt updatedAt lastActiveAt'
      )
      .lean()
  },

  findUserByUsername(username: string) {
    return User.findOne({
      username,
      ...activeOnly,
    })
      .select(
        '_id fullName username email role status emailVerified phoneVerified onboardingCompleted coins xp level streakCount avatarUrl provider referralCode createdAt updatedAt lastActiveAt'
      )
      .lean()
  },

  findProfileByUserId(userId: string | Types.ObjectId) {
    return UserProfile.findOne({
      userId: toObjectId(userId),
      ...activeOnly,
    }).lean()
  },

  async ensureProfileForUser(
    userId: string | Types.ObjectId,
    fallbackName = ''
  ) {
    const id = toObjectId(userId)

    const existing = await UserProfile.findOne({
      userId: id,
      ...activeOnly,
    }).lean()

    if (existing) {
      return existing
    }

    const created = await UserProfile.create({
      userId: id,
      fullName: fallbackName.trim(),
    })

    return created.toObject()
  },

  async updateProfileByUserId(
    userId: string | Types.ObjectId,
    payload: UpdateMyProfileInput
  ) {
    const id = toObjectId(userId)

    await this.ensureProfileForUser(id)

    const updateData = {
      ...(payload.fullName !== undefined
        ? { fullName: payload.fullName.trim() }
        : {}),

      ...(payload.headline !== undefined
        ? { headline: payload.headline.trim() }
        : {}),

      ...(payload.bio !== undefined
        ? { bio: payload.bio.trim() }
        : {}),

      ...(payload.location !== undefined
        ? { location: payload.location.trim() }
        : {}),

      ...(payload.education !== undefined
        ? { education: payload.education.trim() }
        : {}),

      ...(payload.skills !== undefined
        ? { skills: payload.skills }
        : {}),

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

    return UserProfile.findOneAndUpdate(
      {
        userId: id,
        ...activeOnly,
      },
      {
        $set: updateData,
      },
      {
        returnDocument: 'after',
        runValidators: true,
      }
    ).lean()
  },

  findSettingsByUserId(userId: string | Types.ObjectId) {
    return UserSettings.findOne({
      userId: toObjectId(userId),
      ...activeOnly,
    }).lean()
  },

  findLatestStreakSnapshot(userId: string | Types.ObjectId) {
    return StreakSnapshot.findOne({
      userId: toObjectId(userId),
      ...activeOnly,
    })
      .sort({ snapshotDate: -1 })
      .lean()
  },

  findStreakHistoryByYear(
    userId: string | Types.ObjectId,
    year: number
  ) {
    const start = new Date(Date.UTC(year, 0, 1, 0, 0, 0))
    const end = new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0))

    return StreakHistory.find({
      userId: toObjectId(userId),
      date: {
        $gte: start,
        $lt: end,
      },
      ...activeOnly,
    })
      .sort({ date: 1 })
      .lean()
  },

  async findBadgeShowcase(userId: string | Types.ObjectId) {
    const id = toObjectId(userId)

    const [catalog, earned] = await Promise.all([
      Badge.find(activeOnly).sort({ createdAt: 1 }).lean(),
      UserBadge.find({
        userId: id,
        ...activeOnly,
      }).lean(),
    ])

    return {
      catalog,
      earned,
    }
  },

  async findEarnedBadgesPaginated(
    userId: string | Types.ObjectId,
    page = 1,
    limit = 10
  ) {
    const id = toObjectId(userId)
    const skip = (page - 1) * limit
    const filter = {
      userId: id,
      ...activeOnly,
    }

    const [items, total] = await Promise.all([
      UserBadge.find(filter)
        .populate('badgeId')
        .sort({ earnedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      UserBadge.countDocuments(filter),
    ])

    return {
      items,
      total,
    }
  },

  async findPublishedTrackers(
    ownerId: string | Types.ObjectId,
    query: PaginationQuery,
    includePrivate = false
  ) {
    const id = toObjectId(ownerId)
    const skip = (query.page - 1) * query.limit

    const filter: Record<string, unknown> = {
      ownerId: id,
      deletedAt: null,
    }

    if (!includePrivate) {
      filter.visibility = 'public'
    }

    if (query.status) {
      filter.status = query.status
    } else {
      filter.status = 'active'
    }

    if (query.search) {
      filter.$or = [
        {
          title: {
            $regex: query.search,
            $options: 'i',
          },
        },
        {
          description: {
            $regex: query.search,
            $options: 'i',
          },
        },
        {
          category: {
            $regex: query.search,
            $options: 'i',
          },
        },
      ]
    }

    const sort: Record<string, 1 | -1> =
      query.sort === 'createdAt'
        ? { createdAt: -1 }
        : query.sort === 'ratingAverage'
          ? { ratingAverage: -1, createdAt: -1 }
          : query.sort === 'cloneCount'
            ? { cloneCount: -1, createdAt: -1 }
            : { publishedAt: -1, createdAt: -1 }

    const [items, total] = await Promise.all([
      Tracker.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(query.limit)
        .lean(),

      Tracker.countDocuments(filter),
    ])

    return {
      items: items.map((tracker) => ({
        _id: tracker._id.toString(),
        title: tracker.title,
        slug: tracker.slug,
        description: tracker.description ?? '',
        category: tracker.category,
        field: tracker.field,
        goal: tracker.goal,
        level: tracker.level,
        coverImageUrl: tracker.coverImageUrl,
        topicsCount: tracker.topicsCount ?? 0,
        subtopicsCount: tracker.subtopicsCount ?? 0,
        cloneCount: tracker.cloneCount ?? 0,
        likeCount: tracker.likeCount ?? 0,
        saveCount: tracker.saveCount ?? 0,
        progressPercent: tracker.progressPercent ?? 0,
        ratingAverage: tracker.ratingAverage ?? 0,
        ratingCount: tracker.ratingCount ?? 0,
        publishedAt: tracker.publishedAt ?? null,
        createdAt: tracker.createdAt,
      })),
      total,
    }
  },

  async findActivityFeed(
    userId: string | Types.ObjectId,
    page = 1,
    limit = 10
  ) {
    const id = toObjectId(userId)
    const skip = (page - 1) * limit

    const filter = {
      userId: id,
      severity: 'info',
      ...activeOnly,
    }

    const [items, total] = await Promise.all([
      ActivityLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      ActivityLog.countDocuments(filter),
    ])

    return {
      items,
      total,
    }
  },

  findRecentActivity(
    userId: string | Types.ObjectId,
    limit = 10
  ) {
    return ActivityLog.find({
      userId: toObjectId(userId),
      severity: 'info',
      ...activeOnly,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
  },

  async getRelationshipState(
    viewerUserId: string | undefined,
    targetUserId: string | Types.ObjectId
  ): Promise<RelationshipState> {
    if (!viewerUserId) {
      return 'not_connected'
    }

    const viewerId = toObjectId(viewerUserId)
    const targetId = toObjectId(targetUserId)

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

    if (incoming) {
      return 'request_received'
    }

    return 'not_connected'
  },

  updateUserFullName(
    userId: string,
    fullName: string
  ) {
    return User.findOneAndUpdate(
      {
        _id: userId,
        deletedAt: null,
      },
      {
        $set: {
          fullName: fullName.trim(),
        },
      },
      {
        returnDocument: 'after',
      }
    )
  },
}
