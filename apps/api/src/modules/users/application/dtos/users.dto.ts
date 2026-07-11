import type { BadgeType } from '../../domain/value-objects/badge-type.vo'
import type { ProfileSort } from '../../domain/value-objects/profile-sort.vo'
import type { ProfileTrackerStatus } from '../../domain/value-objects/profile-tracker-status.vo'
import type { RelationshipState } from '../../domain/value-objects/relationship-state.vo'
import type { StreakIntensity } from '../../domain/value-objects/streak-intensity.vo'
import type { UserProfileUpdate } from '../../domain/value-objects/user-profile-update.vo'

export type UpdateMyProfileInputDTO = UserProfileUpdate

export interface IPaginationQueryDTO {
  page: number
  limit: number
  search?: string
  status?: ProfileTrackerStatus
  sort?: ProfileSort
}

export interface ICurrentUserViewDTO {
  _id: string
  fullName: string
  username: string
  role: string
  status: string
  email?: string
  emailVerified: boolean
  phoneVerified: boolean
  onboardingCompleted: boolean
  coins: number
  xp: number
  level: number
  streakCount: number
  avatarUrl: string
  provider: string
  referralCode: string
  createdAt?: Date
  updatedAt?: Date
}

export interface IEditableProfileViewDTO {
  _id?: string
  userId: string
  fullName: string
  headline: string
  bio: string
  location: string
  education: string
  skills: string[]
  interests: string[]
  githubUrl: string
  linkedinUrl: string
  portfolioUrl: string
  profileBannerUrl: string
  publicProfileEnabled: boolean
  publishedCount: number
  cloneCount: number
  ratingAverage: number
  likeCount: number
}

export interface IStreakHeatmapDayDTO {
  date: string
  activityCount: number
  intensityLevel: StreakIntensity
  streakDay: number
  isFrozen: boolean
}

export interface IStreakSummaryViewDTO {
  currentStreak: number
  longestStreak: number
  totalActiveDays: number
  totalFreezeUsed: number
  lastActiveDate: string | null
  heatmap: IStreakHeatmapDayDTO[]
}

export interface IBadgeShowcaseItemDTO {
  _id: string
  name: string
  description: string
  iconUrl: string
  badgeType: BadgeType
  earned: boolean
  earnedAt: Date | null
  criteria: Record<string, unknown>
}

export interface IBadgeShowcaseViewDTO {
  earnedCount: number
  totalCount: number
  items: IBadgeShowcaseItemDTO[]
}

export interface IEarnedBadgeViewDTO {
  _id: string
  name: string
  description: string
  iconUrl: string
  badgeType: BadgeType
  criteria: Record<string, unknown>
  earnedAt?: Date | string | null
}

export interface IPublishedTrackerViewDTO {
  _id: string
  title: string
  slug: string
  description: string
  category?: string
  field?: string
  goal?: string
  level?: string
  timeline?: string
  coverImageUrl?: string
  topicsCount: number
  subtopicsCount: number
  cloneCount: number
  likeCount: number
  saveCount: number
  progressPercent: number
  ratingAverage: number
  ratingCount: number
  publishedAt?: Date | null
  createdAt?: Date
}

export interface IActivityFeedItemViewDTO {
  _id: string
  action: string
  module: string
  description: string
  metadata: Record<string, unknown>
  createdAt: Date
}

export interface IProfileStatsViewDTO {
  streakCount: number
  studentLevel: number
  xp: number
  coins: number
  publishedCount: number
  cloneCount: number
  ratingAverage: number
  likeCount: number
}

export interface IPaginationViewDTO {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface IPublicProfilePageViewDTO {
  user: ICurrentUserViewDTO
  profile: IEditableProfileViewDTO
  stats: IProfileStatsViewDTO | null
  streak: IStreakSummaryViewDTO | null
  badges: IBadgeShowcaseViewDTO
  publishedTrackers: {
    items: IPublishedTrackerViewDTO[]
    pagination: IPaginationViewDTO
  }
  recentActivity: IActivityFeedItemViewDTO[] | null
  relationship: RelationshipState
}
