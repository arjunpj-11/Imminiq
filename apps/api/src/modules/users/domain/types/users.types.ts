import type { Types } from 'mongoose'

export type ProfileSort = 'createdAt' | 'publishedAt' | 'ratingAverage' | 'cloneCount'

export type RelationshipState =
  | 'self'
  | 'not_connected'
  | 'friends'
  | 'request_sent'
  | 'request_received'

export interface UpdateMyProfileInput {
  fullName?: string
  headline?: string
  bio?: string
  location?: string
  education?: string
  skills?: string[]
  interests?: string[]
  githubUrl?: string
  linkedinUrl?: string
  portfolioUrl?: string
  publicProfileEnabled?: boolean
}

export interface PaginationQuery {
  page: number
  limit: number
  search?: string
  status?: 'active' | 'draft' | 'archived'
  sort?: ProfileSort
}

export interface CurrentUserView {
  _id: string
  fullName: string
  username: string
  email?: string
  role: string
  status: string
  emailVerified?: boolean
  phoneVerified?: boolean
  onboardingCompleted?: boolean
  coins?: number
  xp?: number
  level?: number
  streakCount?: number
  avatarUrl?: string
  provider?: string
  referralCode?: string
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
  intensityLevel: 'none' | 'low' | 'medium' | 'high'
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
  badgeType: 'streak' | 'test' | 'tracker' | 'battle' | 'community'
  earned: boolean
  earnedAt: Date | null
  criteria: Record<string, unknown>
}

export interface BadgeShowcaseView {
  earnedCount: number
  totalCount: number
  items: BadgeShowcaseItem[]
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
  topicsCount?: number
  subtopicsCount?: number
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

export interface PublicProfilePageView {
  user: CurrentUserView
  profile: EditableProfileView
  stats: ProfileStatsView | null
  streak: StreakSummaryView | null
  badges: BadgeShowcaseView
  publishedTrackers: {
    items: PublishedTrackerView[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
  recentActivity: ActivityFeedItemView[] | null
  relationship: RelationshipState
}

export interface UserProfileLookup {
  userId: Types.ObjectId
  username: string
}

export type IdLike = string | { toString(): string }

export type MetadataRecord = Record<string, unknown>
export type CriteriaRecord = Record<string, unknown>

export interface UserRecord {
  _id: IdLike
  fullName?: string | null
  username?: string | null
  email?: string | null
  role?: CurrentUserView['role'] | null
  status?: CurrentUserView['status'] | null
  emailVerified?: boolean | null
  phoneVerified?: boolean | null
  onboardingCompleted?: boolean | null
  coins?: number | null
  xp?: number | null
  level?: number | null
  streakCount?: number | null
  avatarUrl?: string | null
  provider?: CurrentUserView['provider'] | null
  referralCode?: string | null
  createdAt?: Date
  updatedAt?: Date
}

export interface ProfileRecord {
  _id?: IdLike | null
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

export interface ActivityRecord {
  _id: IdLike
  action?: string | null
  module?: string | null
  metadata?: MetadataRecord | null
  createdAt: Date
}

export interface BadgeCatalogRecord {
  _id: IdLike
  name?: string | null
  description?: string | null
  iconUrl?: string | null
  badgeType: BadgeShowcaseView['items'][number]['badgeType']
  criteria?: CriteriaRecord | null
}

export interface EarnedBadgeShowcaseRecord {
  badgeId: IdLike
  earnedAt?: Date | string | null
}

export interface EarnedBadgeRecord {
  badgeId?: {
    _id: IdLike
    name?: string | null
    description?: string | null
    iconUrl?: string | null
    badgeType: BadgeShowcaseView['items'][number]['badgeType']
    criteria?: CriteriaRecord | null
  } | null
  earnedAt?: Date | string | null
}

export interface StreakHistoryRecord {
  date?: Date | string | null
  activityCount?: number | null
  intensityLevel?: StreakHeatmapDay['intensityLevel'] | null
  streakDay?: number | null
  isFrozen?: boolean | null
}

export interface StreakSnapshotRecord {
  currentStreak?: number | null
  longestStreak?: number | null
  totalActiveDays?: number | null
  totalFreezeUsed?: number | null
}
