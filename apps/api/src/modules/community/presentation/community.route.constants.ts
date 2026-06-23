export const COMMUNITY_ROUTE_PATHS = {
  BROWSE: '/',
  TRACKERS: '/trackers',
  TOPICS: '/topics',
  PERSONAL_STATS: '/stats/personal',
  CLONE_TRACKER: '/trackers/:trackerId/clone',
  SUBMIT_TRACKER_VERIFICATION: '/trackers/:trackerId/verification',
  VERIFY_DASHBOARD: '/verify/dashboard',
  VERIFY_QUEUE: '/verify/queue',
  VERIFY_LEADERBOARD: '/verify/leaderboard',
  VERIFY_SUBMISSION: '/verify/:submissionId',
  VERIFY_VOTE: '/verify/:submissionId/vote',
} as const

export type CommunityRoutePath =
  (typeof COMMUNITY_ROUTE_PATHS)[keyof typeof COMMUNITY_ROUTE_PATHS]