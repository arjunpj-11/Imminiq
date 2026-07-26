import type { BadgeType } from '../domain/value-objects/badge-type.vo';
import type { ProfileSort } from '../domain/value-objects/profile-sort.vo';
import type { ProfileTrackerStatus } from '../domain/value-objects/profile-tracker-status.vo';
import type { RelationshipState } from '../domain/value-objects/relationship-state.vo';
import type { StreakIntensity } from '../domain/value-objects/streak-intensity.vo';
import type { UserProfileUpdate } from '../domain/value-objects/user-profile-update.vo';

export type UpdateMyProfileInputDTO = UserProfileUpdate;

export interface PaginationQueryDTO {
  page: number;
  limit: number;
  search?: string;
  status?: ProfileTrackerStatus;
  sort?: ProfileSort;
}

export interface CurrentUserViewDTO {
  _id: string;
  fullName: string;
  username: string;
  role: string;
  status: string;
  email?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  onboardingCompleted: boolean;
  coins: number;
  xp: number;
  level: number;
  streakCount: number;
  isPremium: boolean;
  avatarUrl: string;
  provider: string;
  referralCode: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MyProfileViewDTO {
  user: CurrentUserViewDTO;
  profile: EditableProfileViewDTO;
}

export interface EditableProfileViewDTO {
  _id?: string;
  userId: string;
  fullName: string;
  headline: string;
  bio: string;
  location: string;
  education: string;
  skills: string[];
  interests: string[];
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
  profileBannerUrl: string;
  publicProfileEnabled: boolean;
  publishedCount: number;
  cloneCount: number;
  ratingAverage: number;
  likeCount: number;
}

export interface StreakHeatmapDayDTO {
  date: string;
  activityCount: number;
  intensityLevel: StreakIntensity;
  streakDay: number;
  isFrozen: boolean;
}

export interface StreakSummaryViewDTO {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  totalFreezeUsed: number;
  lastActiveDate: string | null;
  heatmap: StreakHeatmapDayDTO[];
}

export interface BadgeShowcaseItemDTO {
  _id: string;
  name: string;
  description: string;
  iconUrl: string;
  badgeType: BadgeType;
  earned: boolean;
  earnedAt: Date | null;
  criteria: Record<string, unknown>;
}

export interface BadgeShowcaseViewDTO {
  earnedCount: number;
  totalCount: number;
  items: BadgeShowcaseItemDTO[];
}

export interface EarnedBadgeViewDTO {
  _id: string;
  name: string;
  description: string;
  iconUrl: string;
  badgeType: BadgeType;
  criteria: Record<string, unknown>;
  earnedAt?: Date | string | null;
}

export interface PublishedTrackerViewDTO {
  _id: string;
  title: string;
  slug: string;
  description: string;
  category?: string;
  field?: string;
  goal?: string;
  level?: string;
  timeline?: string;
  coverImageUrl?: string;
  topicsCount: number;
  subtopicsCount: number;
  cloneCount: number;
  likeCount: number;
  saveCount: number;
  progressPercent: number;
  ratingAverage: number;
  ratingCount: number;
  publishedAt?: Date | null;
  createdAt?: Date;
}

export interface ActivityFeedItemViewDTO {
  _id: string;
  action: string;
  module: string;
  description: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface ProfileStatsViewDTO {
  streakCount: number;
  studentLevel: number;
  studentRank: number;
  xp: number;
  teacherLevel: number;
  teacherXp: number;
  teacherRank: number;
  coins: number;
  publishedCount: number;
  cloneCount: number;
  ratingAverage: number;
  likeCount: number;
}

export interface PaginationViewDTO {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PublishedTrackersPageDTO {
  items: PublishedTrackerViewDTO[];
  pagination: PaginationViewDTO;
}

export interface EarnedBadgesPageDTO {
  items: EarnedBadgeViewDTO[];
  pagination: PaginationViewDTO;
}

export interface RecentActivityPageDTO {
  items: ActivityFeedItemViewDTO[];
}

export interface PublicProfilePageViewDTO {
  user: CurrentUserViewDTO;
  profile: EditableProfileViewDTO;
  stats: ProfileStatsViewDTO | null;
  streak: StreakSummaryViewDTO | null;
  badges: BadgeShowcaseViewDTO;
  publishedTrackers: {
    items: PublishedTrackerViewDTO[];
    pagination: PaginationViewDTO;
  };
  recentActivity: ActivityFeedItemViewDTO[] | null;
  relationship: RelationshipState;
}
