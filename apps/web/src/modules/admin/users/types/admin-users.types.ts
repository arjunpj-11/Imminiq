export type AdminUserStatus = 'active' | 'paused' | 'blocked' | 'deactivated' | 'banned'
export type AdminUser = {
  _id: string; fullName: string; username: string; email?: string; phone?: string; avatarUrl?: string
  role: string; status: AdminUserStatus; emailVerified: boolean; phoneVerified: boolean; isPremium?: boolean
  coins?: number; xp?: number; level?: number; streakCount?: number; lastActiveAt: string; createdAt: string; provider?: string
}
export type AdminUsersData = {
  users: AdminUser[]
  stats: { total: number; active: number; blocked: number }
  pagination: { page: number; limit: number; total: number; pages: number }
}
export type AdminUserDetailData = {
  user: AdminUser
  stats: { trackers: number; reports: number; trustScore: number; failedSecurityEvents: number }
  activity: Array<{ id: string; action: string; module: string; severity: string; createdAt: string }>
  securityEvents: Array<{ id: string; eventType: string; outcome: string; createdAt: string; ipAddress: string }>
}
