export const ADMIN_ANALYTICS_ROUTE_PATHS = {
  ROOT: '/',
} as const;

export type AdminAnalyticsRoutePath =
  (typeof ADMIN_ANALYTICS_ROUTE_PATHS)[keyof typeof ADMIN_ANALYTICS_ROUTE_PATHS];
