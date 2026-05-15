export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface ApiErrorResponse {
  success?: boolean
  message?: string
  errors?: Array<{
    field?: string
    message?: string
  }>
}

export interface ProfileUser {
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
  createdAt?: string
  updatedAt?: string
}

export interface EditableUserProfile {
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

export interface GetMyProfileResponse {
  user: ProfileUser
  profile: EditableUserProfile
}

export interface UpdateProfilePayload {
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

export interface ProfileStats {
  streakCount: number
  studentLevel: number
  xp: number
  coins: number
  publishedCount: number
  cloneCount: number
  ratingAverage: number
  likeCount: number
}

export type HeatmapIntensity = 'none' | 'low' | 'medium' | 'high'

export interface StreakHeatmapDay {
  date: string
  activityCount: number
  intensityLevel: HeatmapIntensity
  streakDay: number
  isFrozen: boolean
}

export interface StreakSummary {
  currentStreak: number
  longestStreak: number
  totalActiveDays: number
  totalFreezeUsed: number
  lastActiveDate: string | null
  heatmap: StreakHeatmapDay[]
}

export interface ProfileBadge {
  _id: string
  name: string
  description: string
  iconUrl: string
  badgeType: 'streak' | 'test' | 'tracker' | 'battle' | 'community'
  criteria?: Record<string, unknown>
  earnedAt?: string | null
  earned?: boolean
}

export interface PaginatedResult<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface PublishedTracker {
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
  publishedAt?: string | null
  createdAt?: string
}

export interface ActivityFeedItem {
  _id: string
  action: string
  module: string
  description: string
  metadata: Record<string, unknown>
  createdAt: string
}

export type ProfileRelationshipState =
  | 'self'
  | 'not_connected'
  | 'friends'
  | 'request_sent'
  | 'request_received'

export interface PublicProfilePageData {
  user: ProfileUser
  profile: EditableUserProfile
  stats: ProfileStats | null
  streak: StreakSummary | null
  badges: {
    earnedCount: number
    totalCount: number
    items: ProfileBadge[]
  }
  publishedTrackers: PaginatedResult<PublishedTracker>
  recentActivity: ActivityFeedItem[] | null
  relationship: ProfileRelationshipState
}

export interface ProfileImageUploadResponse {
  uploadId: string
  fileUrl: string
  kind: 'avatar' | 'banner'
}

export interface RemoveAvatarResponse {
  avatarRemoved: boolean
  defaultAvatarApplied: boolean
}

export interface RemoveBannerResponse {
  bannerRemoved: boolean
}
