export type AdminDashboardData = {
  metrics: { totalUsers: number; activeToday: number; blockedUsers: number; totalTrackers: number }
  weeklyActivity: number[]
  recentActivity: Array<{ id: string; action: string; module: string; severity: string; createdAt: string; user: { fullName: string; username: string } | null }>
}
