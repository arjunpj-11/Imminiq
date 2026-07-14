export const ACTIVITY_ROUTE_PATHS = {
  ROOT: '/',
  FEED: '/feed',
} as const;

export type ActivityRoutePath = (typeof ACTIVITY_ROUTE_PATHS)[keyof typeof ACTIVITY_ROUTE_PATHS];
