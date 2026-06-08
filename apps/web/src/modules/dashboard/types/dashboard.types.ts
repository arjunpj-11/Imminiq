// apps/web/src/types/dashboard.types.ts

export interface DashboardUser {
  _id: string
  fullName: string
  username: string
  avatarUrl: string
  isPremium: boolean
  coinBalance: number
}

export interface DashboardStreak {
  current: number
  longest: number
  lastActiveAt: string | null
}

export interface DashboardActiveTracker {
  _id: string
  title: string
  level: string
  completionPercentage: number
  lastStudiedAt: string | null
}

export interface DashboardTrackers {
  total: number
  active: number
  completed: number
  activeTrackers: DashboardActiveTracker[]
}

export interface DashboardStats {
  totalSubtopicsCompleted: number
 
  totalPoints: number
  publishedTrackers: number
}

export interface DashboardRecentActivity {
  type: string
  description: string
  createdAt: string
}

export interface DashboardNotifications {
  unreadCount: number
  hasUnread: boolean
}

export interface DashboardSummary {
  user: DashboardUser
  streak: DashboardStreak
  trackers: DashboardTrackers
  stats: DashboardStats
  recentActivity: DashboardRecentActivity[]
  notifications: DashboardNotifications
  isPremium: boolean
}

export interface DashboardCurrentRoadmap {
  _id: string
  title: string
  level: string
  completionPercentage: number
  lastStudiedAt: string | null
  totalTopics: number
  completedTopics: number
  remainingTopics?: number | null 
}

export interface DashboardActivityIntensityItem {
  date: string
  count: number
  activityCount: number
}

export interface DashboardFriend {
  _id: string
  fullName: string
  username: string
  avatarUrl: string
  lastActiveAt: string | null
  isOnline: boolean
}

export interface DashboardRecommendedAction {
  type: string
  title: string
  description: string
  link: string
}

export interface DashboardRecentBattle {
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

export interface DashboardAIInsight {
  insight: string
}

export interface ApiResponse<T> {
  success?: boolean
  message: string
  data: T
}