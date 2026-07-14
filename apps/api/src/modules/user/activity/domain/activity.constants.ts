import type { ActivityType } from './value-objects/activity-type.vo';

export const ACTIVITY_DEFAULT_FEED_LIMIT = 20;
export const ACTIVITY_MIN_FEED_LIMIT = 1;
export const ACTIVITY_MAX_FEED_LIMIT = 50;

export const ACTIVITY_MIN_YEAR = 2000;
export const ACTIVITY_MAX_UTC_OFFSET_MINUTES = 14 * 60;
export const ACTIVITY_MIN_UTC_OFFSET_MINUTES = -12 * 60;

export const ACTIVITY_WEEKLY_XP_TARGET = 5000;

export const ACTIVITY_DAILY_GOAL_REWARD_XP = 50;

export const ACTIVITY_DAILY_GOAL_TASK_TYPES = [
  'subtopic_completed',
  'mock_test_completed',
] as const satisfies readonly ActivityType[];

export const ACTIVITY_SESSION_TYPES = [
  'subtopic_completed',
  'topic_completed',
  'tracker_completed',
  'mock_test_completed',
  'community_review_completed',
] as const satisfies readonly ActivityType[];
