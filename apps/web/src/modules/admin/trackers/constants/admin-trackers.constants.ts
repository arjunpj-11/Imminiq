import { ADMIN_ROUTES } from '../../../../routes/config/route-paths';

export const ADMIN_TRACKERS_ENDPOINTS = {
  list: '/admin/trackers',
  detail: (trackerId: string) => `/admin/trackers/${trackerId}`,
  published: '/admin/trackers/published',
  likePublished: (trackerId: string) => `/admin/trackers/published/${trackerId}/like`,
  ratePublished: (trackerId: string) => `/admin/trackers/published/${trackerId}/rating`,
} as const;

export const ADMIN_TRACKERS_ROUTES = {
  list: ADMIN_ROUTES.trackers,
  detail: ADMIN_ROUTES.trackerDetail,
  reviews: ADMIN_ROUTES.trackerReviews,
  published: ADMIN_ROUTES.publishedTrackers,
} as const;

export const ADMIN_TRACKERS_STALE_TIME_MS = 30_000;
