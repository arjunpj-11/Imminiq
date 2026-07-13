export const ACTIVITY_TYPES = [
  'subtopic_completed',
  'topic_completed',
  'tracker_completed',

  'mock_test_generated',
  'mock_test_completed',

  'tracker_cloned',
  'tracker_verified',
  'community_review_completed',

  'streak_milestone',
  'xp_milestone',
  'daily_goal_completed',
] as const

export type ActivityType = (typeof ACTIVITY_TYPES)[number]
