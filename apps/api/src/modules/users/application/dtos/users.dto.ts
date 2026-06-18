import type { BadgeType } from '../../domain/value-objects/badge-type.vo'
import type { ProfileSort } from '../../domain/value-objects/profile-sort.vo'
import type { ProfileTrackerStatus } from '../../domain/value-objects/profile-tracker-status.vo'
import type { RelationshipState } from '../../domain/value-objects/relationship-state.vo'
import type { StreakIntensity } from '../../domain/value-objects/streak-intensity.vo'
import type { UserProfileUpdate } from '../../domain/value-objects/user-profile-update.vo'

export type UpdateMyProfileInput = UserProfileUpdate

export interface PaginationQuery {
  page: number
  limit: number
  search?: string
  status?: ProfileTrackerStatus
  sort?: ProfileSort
}

export interface CurrentUserView {
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

export interface EditableProfileView {
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

export interface StreakHeatmapDay {
  date: string
  activityCount: number
  intensityLevel: StreakIntensity
  streakDay: number
  isFrozen: boolean
}

export interface StreakSummaryView {
  currentStreak: number
  longestStreak: number
  totalActiveDays: number
  totalFreezeUsed: number
  lastActiveDate: string | null
  heatmap: StreakHeatmapDay[]
}

export interface BadgeShowcaseItem {
  _id: string
  name: string
  description: string
  iconUrl: string
  badgeType: BadgeType
  earned: boolean
  earnedAt: Date | null
  criteria: Record<string, unknown>
}

export interface BadgeShowcaseView {
  earnedCount: number
  totalCount: number
  items: BadgeShowcaseItem[]
}

export interface EarnedBadgeView {
  _id: string
  name: string
  description: string
  iconUrl: string
  badgeType: BadgeType
  criteria: Record<string, unknown>
  earnedAt?: Date | string | null
}

export interface PublishedTrackerView {
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

export interface ActivityFeedItemView {
  _id: string
  action: string
  module: string
  description: string
  metadata: Record<string, unknown>
  createdAt: Date
}

export interface ProfileStatsView {
  streakCount: number
  studentLevel: number
  xp: number
  coins: number
  publishedCount: number
  cloneCount: number
  ratingAverage: number
  likeCount: number
}

export interface PaginationView {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PublicProfilePageView {
  user: CurrentUserView
  profile: EditableProfileView
  stats: ProfileStatsView | null
  streak: StreakSummaryView | null
  badges: BadgeShowcaseView
  publishedTrackers: {
    items: PublishedTrackerView[]
    pagination: PaginationView
  }
  recentActivity: ActivityFeedItemView[] | null
  relationship: RelationshipState
}
