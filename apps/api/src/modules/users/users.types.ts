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
