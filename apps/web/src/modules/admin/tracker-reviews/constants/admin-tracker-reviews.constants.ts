import { ADMIN_ROUTES } from '../../../../routes/config/route-paths';

export const ADMIN_TRACKER_REVIEWS_ENDPOINTS = {
  list: '/admin/tracker-reviews',
  status: (reviewId: string) => `/admin/tracker-reviews/${reviewId}/status`,
  consensus: (reviewId: string) => `/admin/tracker-reviews/${reviewId}/consensus`,
} as const;

export const ADMIN_TRACKER_REVIEWS_ROUTES = {
  list: ADMIN_ROUTES.trackerReviews,
  trackerDetail: ADMIN_ROUTES.trackerDetail,
  trackers: ADMIN_ROUTES.trackers,
} as const;

export const ADMIN_TRACKER_REVIEWS_STALE_TIME_MS = 15_000;
