export const COMMUNITY_ROUTE_PATHS = {
  BROWSE: '/',
  TRACKER_DETAIL: '/trackers/:trackerId',
  TRACKER_REVIEW: '/trackers/:trackerId/reviews',
  REVIEW_HELPFUL: '/reviews/:reviewId/helpful',
  CLONE_TRACKER: '/trackers/:trackerId/clone',
  SUBMIT_TRACKER_VERIFICATION: '/trackers/:trackerId/verification',
  VERIFY_DASHBOARD: '/verify/dashboard',
  VERIFY_SUBMISSION: '/verify/:submissionId',
  VERIFY_VOTE: '/verify/:submissionId/vote',
  TRACKER_LIKE: '/trackers/:trackerId/like',
} as const

export type CommunityRoutePath =
  (typeof COMMUNITY_ROUTE_PATHS)[keyof typeof COMMUNITY_ROUTE_PATHS]
