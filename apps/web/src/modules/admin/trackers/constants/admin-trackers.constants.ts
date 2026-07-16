import { ADMIN_ROUTES } from '../../../../routes/config/route-paths';

export const ADMIN_TRACKERS_ENDPOINTS = {
  list: '/admin/trackers',
  detail: (trackerId: string) => `/admin/trackers/${trackerId}`,
  published: '/admin/trackers/published',
  reports: '/admin/trackers/reports',
  updateReport: (reportId: string) => `/admin/trackers/reports/${reportId}`,
  reviews: '/admin/trackers/reviews',
  reviewStatus: (reviewId: string) => `/admin/trackers/reviews/${reviewId}/status`,
  reviewConsensus: (reviewId: string) => `/admin/trackers/reviews/${reviewId}/consensus`,
  lifecycle: (trackerId: string) => `/admin/trackers/${trackerId}/lifecycle`,
  likePublished: (trackerId: string) => `/admin/trackers/published/${trackerId}/like`,
  ratePublished: (trackerId: string) => `/admin/trackers/published/${trackerId}/rating`,
  versions: (trackerId: string) => `/admin/trackers/${trackerId}/versions`,
  restoreVersion: (trackerId: string, version: number) => `/admin/trackers/${trackerId}/versions/${version}/restore`,
} as const;

export const ADMIN_TRACKERS_ROUTES = {
  list: ADMIN_ROUTES.trackers,
  detail: ADMIN_ROUTES.trackerDetail,
  reviews: ADMIN_ROUTES.trackerReviews,
  published: ADMIN_ROUTES.publishedTrackers,
  reports: ADMIN_ROUTES.trackerReports,
} as const;

export const ADMIN_TRACKERS_STALE_TIME_MS = 30_000;
