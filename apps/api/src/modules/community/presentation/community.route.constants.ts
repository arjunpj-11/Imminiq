export const COMMUNITY_ROUTE_PATHS = {
  BROWSE: '/',
  TRACKERS: '/trackers',
  TRACKER_DETAIL: '/trackers/:trackerId',
  TRACKER_REVIEW: '/trackers/:trackerId/reviews',
  REVIEW_HELPFUL: '/reviews/:reviewId/helpful',
  TOPICS: '/topics',
  PERSONAL_STATS: '/stats/personal',
  CLONE_TRACKER: '/trackers/:trackerId/clone',
  SUBMIT_TRACKER_VERIFICATION: '/trackers/:trackerId/verification',
  VERIFY_DASHBOARD: '/verify/dashboard',
  VERIFY_QUEUE: '/verify/queue',
  VERIFY_LEADERBOARD: '/verify/leaderboard',
  VERIFY_SUBMISSION: '/verify/:submissionId',
  VERIFY_VOTE: '/verify/:submissionId/vote',
  TRACKER_LIKE: '/trackers/:trackerId/like',
} as const

export type CommunityRoutePath =
  (typeof COMMUNITY_ROUTE_PATHS)[keyof typeof COMMUNITY_ROUTE_PATHS]
