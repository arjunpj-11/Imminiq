export type AdminAnalyticsPoint = { date: string; value: number }
export type AdminAnalytics = { rangeDays: number; metrics: { users: number; activeUsers: number; trackers: number; tests: number; attempts: number }; dailyUsers: AdminAnalyticsPoint[]; dailyActivity: AdminAnalyticsPoint[] }
