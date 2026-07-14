export const ADMIN_TRACKER_REVIEWS_ROUTE_PATHS = {
  ROOT: '/',
  CONSENSUS: '/:id/consensus',
  STATUS: '/:id/status',
} as const;

export type AdminTrackerReviewsRoutePath =
  (typeof ADMIN_TRACKER_REVIEWS_ROUTE_PATHS)[keyof typeof ADMIN_TRACKER_REVIEWS_ROUTE_PATHS];
