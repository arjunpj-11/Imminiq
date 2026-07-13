import type { ReactNode } from 'react'

export interface IProfileData {
  name: string
  username: string
  profession: string
  bio: string
  city: string
  state: string
  country: string
  postal: string
  skills: string[]
  avatarUrl: string | null
  bannerDataUrl: string | null
  githubUrl: string
  linkedinUrl: string
  portfolioUrl: string
}

export type ToastTone = 'info' | 'loading' | 'success' | 'error'

export type SubmitActionKey =
  | 'profile-save'
  | 'avatar-upload'
  | 'banner-upload'
  | 'friend-request'

export type BadgeColor = 'fire' | 'green' | 'amber' | 'blue' | 'locked'

export interface IProfileBadgeViewModel {
  id: string
  emoji: string
  name: string
  desc: string
  color: BadgeColor
  earned: boolean
  tier: string
  iconUrl?: string
}

export interface IActivityVisualViewModel {
  dot: string
  iconColor: string
  icon: ReactNode
}

export interface IApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface IApiErrorResponse {
  success?: boolean
  message?: string
  errors?: Array<{
    field?: string
    message?: string
  }>
}

export interface IProfileUser {
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

export interface IEditableUserProfile {
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

export interface IGetMyProfileResponse {
  user: IProfileUser
  profile: IEditableUserProfile
}

export interface IUpdateProfilePayload {
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

export interface IProfileStats {
  streakCount: number
  studentLevel: number
  studentRank: number
  xp: number
  teacherLevel: number
  teacherXp: number
  teacherRank: number
  coins: number
  publishedCount: number
  cloneCount: number
  ratingAverage: number
  likeCount: number
}

export type HeatmapIntensity = 'none' | 'low' | 'medium' | 'high'

export interface IStreakHeatmapDay {
  date: string
  activityCount: number
  intensityLevel: HeatmapIntensity
  streakDay: number
  isFrozen: boolean
}

export interface IStreakSummary {
  currentStreak: number
  longestStreak: number
  totalActiveDays: number
  totalFreezeUsed: number
  lastActiveDate: string | null
  heatmap: IStreakHeatmapDay[]
}

export interface IProfileBadge {
  _id: string
  name: string
  description: string
  iconUrl: string
  badgeType: 'streak' | 'test' | 'tracker' | 'battle' | 'community'
  criteria?: Record<string, unknown>
  earnedAt?: string | null
  earned?: boolean
}

export interface IPaginatedResult<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface IPublishedTracker {
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

export interface IActivityFeedItem {
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

export interface IPublicProfilePageData {
  user: IProfileUser
  profile: IEditableUserProfile
  stats: IProfileStats | null
  streak: IStreakSummary | null
  badges: {
    earnedCount: number
    totalCount: number
    items: IProfileBadge[]
  }
  publishedTrackers: IPaginatedResult<IPublishedTracker>
  recentActivity: IActivityFeedItem[] | null
  relationship: ProfileRelationshipState
}

export interface IProfileImageUploadResponse {
  uploadId: string
  fileUrl: string
  kind: 'avatar' | 'banner'
}

export interface IRemoveAvatarResponse {
  avatarRemoved: boolean
  defaultAvatarApplied: boolean
}

export interface IRemoveBannerResponse {
  bannerRemoved: boolean
}
