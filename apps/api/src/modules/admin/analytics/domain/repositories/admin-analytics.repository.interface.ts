import type { AdminAnalytics, AdminAnalyticsRange } from '../admin-analytics.entity';
export interface IAdminAnalyticsRepository {
  get(range: AdminAnalyticsRange): Promise<AdminAnalytics>;
}
