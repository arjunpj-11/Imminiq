import type { EarnedUserBadgeEntity } from '../domain/entities/earned-user-badge.entity';
import type { PublishedTrackerEntity } from '../domain/entities/published-tracker.entity';
import type { UserActivityEntity } from '../domain/entities/user-activity.entity';
import type { UserBadgeEntity } from '../domain/entities/user-badge.entity';
import type { UserProfileEntity } from '../domain/entities/user-profile.entity';
import type { UserStreakDayEntity } from '../domain/entities/user-streak-day.entity';
import type { UserEntity } from '../domain/entities/user.entity';
import type {
  ActivityFeedItemViewDTO,
  BadgeShowcaseItemDTO,
  CurrentUserViewDTO,
  EarnedBadgeViewDTO,
  EditableProfileViewDTO,
  PublishedTrackerViewDTO,
  StreakHeatmapDayDTO,
} from './users.dto';

export interface IUsersMapper {
  toUserView(user: UserEntity): CurrentUserViewDTO;
  toProfileView(profile: UserProfileEntity): EditableProfileViewDTO;
  toActivityView(activity: UserActivityEntity): ActivityFeedItemViewDTO;
  toBadgeShowcaseItem(
    badge: UserBadgeEntity,
    earnedAt?: Date | string | null
  ): BadgeShowcaseItemDTO;
  toEarnedBadgeView(earnedBadge: EarnedUserBadgeEntity): EarnedBadgeViewDTO;
  toPublishedTrackerView(tracker: PublishedTrackerEntity): PublishedTrackerViewDTO;
  toStreakHeatmapDay(day: UserStreakDayEntity): StreakHeatmapDayDTO;
}

export class UsersMapper implements IUsersMapper {
  toUserView(user: UserEntity): CurrentUserViewDTO {
    return {
      _id: user.id,
      fullName: user.fullName,
      username: user.username,
      ...(user.email ? { email: user.email } : {}),
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      onboardingCompleted: user.onboardingCompleted,
      coins: user.coins,
      xp: user.xp,
      level: user.level,
      streakCount: user.streakCount,
      isPremium: user.isPremium,
      avatarUrl: user.avatarUrl,
      provider: user.provider,
      referralCode: user.referralCode,
      ...(user.createdAt ? { createdAt: user.createdAt } : {}),
      ...(user.updatedAt ? { updatedAt: user.updatedAt } : {}),
    };
  }

  toProfileView(profile: UserProfileEntity): EditableProfileViewDTO {
    return {
      ...(profile.id ? { _id: profile.id } : {}),
      userId: profile.userId,
      fullName: profile.fullName,
      headline: profile.headline,
      bio: profile.bio,
      location: profile.location,
      education: profile.education,
      skills: profile.skills,
      interests: profile.interests,
      githubUrl: profile.githubUrl,
      linkedinUrl: profile.linkedinUrl,
      portfolioUrl: profile.portfolioUrl,
      profileBannerUrl: profile.profileBannerUrl,
      publicProfileEnabled: profile.publicProfileEnabled,
      publishedCount: profile.publishedCount,
      cloneCount: profile.cloneCount,
      ratingAverage: profile.ratingAverage,
      likeCount: profile.likeCount,
    };
  }

  toActivityView(activity: UserActivityEntity): ActivityFeedItemViewDTO {
    const description = activity.metadata.description;

    return {
      _id: activity.id,
      action: activity.action,
      module: activity.module,
      description:
        typeof description === 'string' && description
          ? description
          : this.humanizeAction(activity.action),
      metadata: activity.metadata,
      createdAt: activity.createdAt,
    };
  }

  toBadgeShowcaseItem(
    badge: UserBadgeEntity,
    earnedAt?: Date | string | null
  ): BadgeShowcaseItemDTO {
    return {
      _id: badge.id,
      name: badge.name,
      description: badge.description,
      iconUrl: badge.iconUrl,
      badgeType: badge.badgeType,
      earned: earnedAt !== undefined && earnedAt !== null,
      earnedAt: this.toDateOrNull(earnedAt),
      criteria: badge.criteria,
    };
  }

  toEarnedBadgeView(earnedBadge: EarnedUserBadgeEntity): EarnedBadgeViewDTO {
    return {
      _id: earnedBadge.badge.id,
      name: earnedBadge.badge.name,
      description: earnedBadge.badge.description,
      iconUrl: earnedBadge.badge.iconUrl,
      badgeType: earnedBadge.badge.badgeType,
      criteria: earnedBadge.badge.criteria,
      ...(earnedBadge.earnedAt !== undefined ? { earnedAt: earnedBadge.earnedAt } : {}),
    };
  }

  toPublishedTrackerView(tracker: PublishedTrackerEntity): PublishedTrackerViewDTO {
    return {
      _id: tracker.id,
      title: tracker.title,
      slug: tracker.slug,
      description: tracker.description,
      ...(tracker.category ? { category: tracker.category } : {}),
      ...(tracker.field ? { field: tracker.field } : {}),
      ...(tracker.goal ? { goal: tracker.goal } : {}),
      ...(tracker.level ? { level: tracker.level } : {}),
      ...(tracker.timeline ? { timeline: tracker.timeline } : {}),
      ...(tracker.coverImageUrl ? { coverImageUrl: tracker.coverImageUrl } : {}),
      topicsCount: tracker.topicsCount,
      subtopicsCount: tracker.subtopicsCount,
      cloneCount: tracker.cloneCount,
      likeCount: tracker.likeCount,
      saveCount: tracker.saveCount,
      progressPercent: tracker.progressPercent,
      ratingAverage: tracker.ratingAverage,
      ratingCount: tracker.ratingCount,
      ...(tracker.publishedAt !== undefined ? { publishedAt: tracker.publishedAt } : {}),
      ...(tracker.createdAt ? { createdAt: tracker.createdAt } : {}),
    };
  }

  toStreakHeatmapDay(day: UserStreakDayEntity): StreakHeatmapDayDTO {
    return {
      date: this.formatDate(day.date) ?? '',
      activityCount: day.activityCount,
      intensityLevel: day.intensityLevel,
      streakDay: day.streakDay,
      isFrozen: day.isFrozen,
    };
  }

  private humanizeAction(action: string): string {
    if (!action) return 'Activity logged';

    return action
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private formatDate(value: Date | string | null | undefined): string | null {
    if (!value) return null;

    const date = value instanceof Date ? value : new Date(value);

    return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
  }

  private toDateOrNull(value: Date | string | null | undefined): Date | null {
    if (!value) return null;

    const date = value instanceof Date ? value : new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
  }
}
