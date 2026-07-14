import type { BadgeType } from '../../../domain/value-objects/badge-type.vo';
import type { StreakIntensity } from '../../../domain/value-objects/streak-intensity.vo';

export type MongoIdLike = {
  toString(): string;
};

export type MongoUserRecord = {
  _id: MongoIdLike;
  fullName?: string | null;
  username?: string | null;
  email?: string | null;
  role?: string | null;
  status?: string | null;
  emailVerified?: boolean | null;
  phoneVerified?: boolean | null;
  onboardingCompleted?: boolean | null;
  coins?: number | null;
  xp?: number | null;
  level?: number | null;
  teacherXp?: number | null;
  teacherLevel?: number | null;
  streakCount?: number | null;
  avatarUrl?: string | null;
  provider?: string | null;
  referralCode?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type MongoProfileRecord = {
  _id?: MongoIdLike | null;
  userId?: MongoIdLike | null;
  fullName?: string | null;
  headline?: string | null;
  bio?: string | null;
  location?: string | null;
  education?: string | null;
  skills?: string[] | null;
  interests?: string[] | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  profileBannerUrl?: string | null;
  publicProfileEnabled?: boolean | null;
  publishedCount?: number | null;
  cloneCount?: number | null;
  ratingAverage?: number | null;
  likeCount?: number | null;
};

export type MongoPrivacySettingsRecord = {
  privacyShowProfile?: boolean | null;
  privacyShowStats?: boolean | null;
  privacyShowTrackers?: boolean | null;
  privacyShowActivity?: boolean | null;
};

export type MongoStreakSnapshotRecord = {
  currentStreak?: number | null;
  longestStreak?: number | null;
  totalActiveDays?: number | null;
  totalFreezeUsed?: number | null;
};

export type MongoStreakHistoryRecord = {
  date?: Date | string | null;
  activityCount?: number | null;
  intensityLevel?: StreakIntensity | null;
  streakDay?: number | null;
  isFrozen?: boolean | null;
};

export type MongoBadgeRecord = {
  _id: MongoIdLike;
  name?: string | null;
  description?: string | null;
  iconUrl?: string | null;
  badgeType?: BadgeType | null;
  criteria?: Record<string, unknown> | null;
};

export type MongoEarnedBadgeRecord = {
  badgeId?: MongoBadgeRecord | MongoIdLike | null;
  earnedAt?: Date | string | null;
};

export type MongoActivityRecord = {
  _id: MongoIdLike;
  action?: string | null;
  module?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt?: Date | null;
};

export type MongoTrackerRecord = {
  _id: MongoIdLike;
  title?: string | null;
  slug?: string | null;
  description?: string | null;
  category?: string | null;
  field?: string | null;
  goal?: string | null;
  level?: string | null;
  timeline?: string | null;
  coverImageUrl?: string | null;
  topicsCount?: number | null;
  subtopicsCount?: number | null;
  cloneCount?: number | null;
  likeCount?: number | null;
  saveCount?: number | null;
  progressPercent?: number | null;
  ratingAverage?: number | null;
  ratingCount?: number | null;
  publishedAt?: Date | null;
  createdAt?: Date;
};

export type MongoDuplicateKeyError = {
  code?: number;
};
