export const ADMIN_TRACKERS_ROUTE_PATHS = {
  ROOT: '/',
  PUBLISHED: '/published',
  PUBLISHED_LIKE: '/published/:id/like',
  PUBLISHED_RATING: '/published/:id/rating',
  DETAIL: '/:id',
  REPORTS: '/reports',
  REPORT_DETAIL: '/reports/:reportId',
  LIFECYCLE: '/:id/lifecycle',
} as const;

export type AdminTrackersRoutePath =
  (typeof ADMIN_TRACKERS_ROUTE_PATHS)[keyof typeof ADMIN_TRACKERS_ROUTE_PATHS];
