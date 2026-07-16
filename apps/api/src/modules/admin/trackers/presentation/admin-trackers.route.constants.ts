export const ADMIN_TRACKERS_ROUTE_PATHS = {
  ROOT: '/',
  EXPORT: '/export.csv',
  BULK_LIFECYCLE: '/bulk/lifecycle',
  PUBLISHED: '/published',
  PUBLISHED_LIKE: '/published/:id/like',
  PUBLISHED_RATING: '/published/:id/rating',
  DETAIL: '/:id',
  REPORTS: '/reports',
  REPORT_DETAIL: '/reports/:reportId',
  APPEALS: '/appeals',
  APPEAL_DETAIL: '/appeals/:appealId',
  LIFECYCLE: '/:id/lifecycle',
  REVIEWS: '/reviews',
  REVIEW_CONSENSUS: '/reviews/:reviewId/consensus',
  REVIEW_STATUS: '/reviews/:reviewId/status',
  VERSIONS: '/:id/versions',
  VERSION_RESTORE: '/:id/versions/:version/restore',
} as const;

export type AdminTrackersRoutePath =
  (typeof ADMIN_TRACKERS_ROUTE_PATHS)[keyof typeof ADMIN_TRACKERS_ROUTE_PATHS];
