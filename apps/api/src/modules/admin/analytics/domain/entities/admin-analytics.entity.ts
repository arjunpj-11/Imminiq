export type AdminAnalyticsPoint = { date: string; value: number };
export type AdminAnalytics = {
  rangeDays: number;
  rangeFrom: string;
  rangeTo: string;
  metrics: {
    users: number;
    activeUsers: number;
    trackers: number;
    tests: number;
    attempts: number;
  };
  dailyUsers: AdminAnalyticsPoint[];
  dailyActivity: AdminAnalyticsPoint[];
};
export type AdminAnalyticsRange = {
  from: Date;
  to: Date;
  days: number;
};
