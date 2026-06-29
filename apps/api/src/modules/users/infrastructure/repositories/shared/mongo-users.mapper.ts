import { EarnedUserBadgeEntity } from '../../../domain/entities/earned-user-badge.entity'
import { PublishedTrackerEntity } from '../../../domain/entities/published-tracker.entity'
import { UserActivityEntity } from '../../../domain/entities/user-activity.entity'
import { UserBadgeEntity } from '../../../domain/entities/user-badge.entity'
import { UserPrivacySettingsEntity } from '../../../domain/entities/user-privacy-settings.entity'
import { UserProfileEntity } from '../../../domain/entities/user-profile.entity'
import { UserStreakDayEntity } from '../../../domain/entities/user-streak-day.entity'
import { UserStreakSnapshotEntity } from '../../../domain/entities/user-streak-snapshot.entity'
import { UserEntity } from '../../../domain/entities/user.entity'
import { UsersDomainError } from '../../../domain/errors/users-domain.error'
import type { PublishedTrackerQuery } from '../../../domain/value-objects/published-tracker-query.vo'
import type { UserIdInput } from '../../../domain/value-objects/user-id.vo'
import type { UserProfileUpdate } from '../../../domain/value-objects/user-profile-update.vo'
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

export class MongoUsersMapper {
  toUserEntity(user: MongoUserRecord): UserEntity {
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

  toUserProfileEntity(
    profile: MongoProfileRecord,
    fallbackUserId: UserIdInput
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

  toPrivacySettingsEntity(
    settings: MongoPrivacySettingsRecord
  ): UserPrivacySettingsEntity {
    return new UserPrivacySettingsEntity({
      showProfile: settings.privacyShowProfile ?? true,
      showStats: settings.privacyShowStats ?? true,
      showTrackers: settings.privacyShowTrackers ?? true,
      showActivity: settings.privacyShowActivity ?? true,
    })
  }

  toUserActivityEntity(activity: MongoActivityRecord): UserActivityEntity {
    if (!activity.createdAt) {
      throw new UsersDomainError(
        'MAPPING_FAILED',
        'User activity is missing its creation date'
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

  toUserBadgeEntity(badge: MongoBadgeRecord): UserBadgeEntity {
    if (!badge.badgeType) {
      throw new UsersDomainError(
        'MAPPING_FAILED',
        'User badge is missing its badge type'
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

  toEarnedUserBadgeEntity(
    earnedBadge: MongoEarnedBadgeRecord
  ): EarnedUserBadgeEntity {
    if (!this.isMongoBadgeRecord(earnedBadge.badgeId)) {
      throw new UsersDomainError(
        'MAPPING_FAILED',
        'Earned badge details were not populated'
      )
    }

    return new EarnedUserBadgeEntity({
      badge: this.toUserBadgeEntity(earnedBadge.badgeId),
      ...(earnedBadge.earnedAt !== undefined
        ? { earnedAt: earnedBadge.earnedAt }
        : {}),
    })
  }

  toStreakSnapshotEntity(
    snapshot: MongoStreakSnapshotRecord
  ): UserStreakSnapshotEntity {
    return new UserStreakSnapshotEntity({
      currentStreak: Number(snapshot.currentStreak ?? 0),
      longestStreak: Number(snapshot.longestStreak ?? 0),
      totalActiveDays: Number(snapshot.totalActiveDays ?? 0),
      totalFreezeUsed: Number(snapshot.totalFreezeUsed ?? 0),
    })
  }

  toStreakDayEntity(day: MongoStreakHistoryRecord): UserStreakDayEntity {
    if (!day.date) {
      throw new UsersDomainError(
        'MAPPING_FAILED',
        'Streak history is missing its date'
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

  toPublishedTrackerEntity(
    tracker: MongoTrackerRecord
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

  toProfileUpdateData(payload: UserProfileUpdate): Record<string, unknown> {
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

  escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  buildTrackerSort(
    sortBy: PublishedTrackerQuery['sort']
  ): Record<string, 1 | -1> {
    if (sortBy === 'createdAt') return { createdAt: -1 }

    if (sortBy === 'ratingAverage') {
      return {
        ratingAverage: -1,
        createdAt: -1,
      }
    }

    if (sortBy === 'cloneCount') {
      return {
        cloneCount: -1,
        createdAt: -1,
      }
    }

    return {
      publishedAt: -1,
      createdAt: -1,
    }
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
  }

  private isMongoBadgeRecord(value: unknown): value is MongoBadgeRecord {
    return this.isRecord(value) && '_id' in value
  }
}