export interface IAdminAnalyticsDTO {
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
  dailyUsers: Array<{ date: string; value: number }>;
  dailyActivity: Array<{ date: string; value: number }>;
}
