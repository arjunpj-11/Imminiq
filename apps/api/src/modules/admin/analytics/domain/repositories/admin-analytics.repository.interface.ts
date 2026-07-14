import type { AdminAnalytics, AdminAnalyticsRange } from '../entities/admin-analytics.entity';
export interface IAdminAnalyticsRepository {
  get(range: AdminAnalyticsRange): Promise<AdminAnalytics>;
}
