import type { AdminAnalytics } from '../admin-analytics.entity';
export interface IAdminAnalyticsRepository {
  get(days: number): Promise<AdminAnalytics>;
}
