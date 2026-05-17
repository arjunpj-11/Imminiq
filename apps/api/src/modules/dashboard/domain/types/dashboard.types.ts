export interface DashboardUserSummary {
  _id: string
  fullName: string
  username: string
  avatarUrl: string
  isPremium: boolean
  coinBalance: number
}

export interface DashboardStreakSummary {
  current: number
  longest: number
  lastActiveAt: Date | null
}

export interface DashboardActiveTracker {
  _id: string
  title: string
  level: string
  completionPercentage: number
  lastStudiedAt: Date | null
}

export interface DashboardTrackerSummary {
  total: number
  active: number
  completed: number
  activeTrackers: DashboardActiveTracker[]
}

export interface DashboardStats {
  totalSubtopicsCompleted: number
  totalTimeSpentMinutes: number
  totalPoints: number
  publishedTrackers: number
}

export interface DashboardRecentActivity {
  type: string
  description: string
  createdAt: Date
}

export interface DashboardNotificationMeta {
  unreadCount: number
  hasUnread: boolean
}

export interface DashboardSummary {
  user: DashboardUserSummary
  streak: DashboardStreakSummary
  trackers: DashboardTrackerSummary
  stats: DashboardStats
  recentActivity: DashboardRecentActivity[]
  notifications: DashboardNotificationMeta
  isPremium: boolean
}

export interface DashboardActivityIntensityItem {
  date: string
  count: number
  minutes: number
}

export interface DashboardFriendItem {
  _id: string
  fullName: string
  username: string
  avatarUrl: string
  lastActiveAt: Date | null
  isOnline: boolean
}

export interface DashboardRecommendedAction {
  type: string
  title: string
  description: string
  link: string
}

export interface DashboardBattleItem {
  _id: string
  opponent: {
    _id: string
    fullName: string
    username: string
    avatarUrl: string
  } | null
  myScore: number
  opponentScore: number
  result: 'win' | 'loss' | 'draw'
  completedAt: Date
}
