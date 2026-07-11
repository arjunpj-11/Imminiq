// apps/web/src/types/dashboard.types.ts

export interface IDashboardUser {
  _id: string
  fullName: string
  username: string
  avatarUrl: string
  isPremium: boolean
  coinBalance: number
}

export interface IDashboardStreak {
  current: number
  longest: number
  lastActiveAt: string | null
}

export interface IDashboardActiveTracker {
  _id: string
  title: string
  level: string
  completionPercentage: number
  lastStudiedAt: string | null
}

export interface IDashboardTrackers {
  total: number
  active: number
  completed: number
  activeTrackers: IDashboardActiveTracker[]
}

export interface IDashboardStats {
  totalSubtopicsCompleted: number
 
  totalPoints: number
  publishedTrackers: number
}

export interface IDashboardRecentActivity {
  type: string
  description: string
  createdAt: string
}

export interface IDashboardNotifications {
  unreadCount: number
  hasUnread: boolean
}

export interface IDashboardSummary {
  user: IDashboardUser
  streak: IDashboardStreak
  trackers: IDashboardTrackers
  stats: IDashboardStats
  recentActivity: IDashboardRecentActivity[]
  notifications: IDashboardNotifications
  isPremium: boolean
}

export interface IDashboardCurrentRoadmap {
  _id: string
  title: string
  level: string
  completionPercentage: number
  lastStudiedAt: string | null
  totalTopics: number
  completedTopics: number
  remainingTopics?: number | null 
}

export interface IDashboardActivityIntensityItem {
  date: string
  count: number
  activityCount: number
}

export interface IDashboardFriend {
  _id: string
  fullName: string
  username: string
  avatarUrl: string
  lastActiveAt: string | null
  isOnline: boolean
}

export interface IDashboardRecommendedAction {
  type: string
  title: string
  description: string
  link: string
}

export interface IDashboardRecentBattle {
  _id: string
  opponent: {
    _id: string
    fullName: string
    username: string
    avatarUrl: string
  } | null
  result: 'win' | 'loss' | 'draw'
  startedAt: string | null
  completedAt: string
}

export interface IDashboardAIInsight {
  insight: string
}

export interface IApiResponse<T> {
  success?: boolean
  message: string
  data: T
}