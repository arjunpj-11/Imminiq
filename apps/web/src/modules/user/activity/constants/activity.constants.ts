import type { ActivityFeedFilter } from '../types/activity.types';

export const ACTIVITY_ENDPOINTS = {
  page: '/activity',
  feed: '/activity/feed',
} as const;

export const ACTIVITY_QUERY_ROOT = 'activity';

export const ACTIVITY_DEFAULT_FEED_LIMIT = 20;
export const ACTIVITY_STALE_TIME_MS = 30_000;
export const ACTIVITY_MIN_YEAR = 2000;

export const ACTIVITY_FILTER_OPTIONS: ReadonlyArray<{
  value: ActivityFeedFilter;
  label: string;
}> = [
  { value: 'all', label: 'All' },
  { value: 'trackers', label: 'Trackers' },
  { value: 'mock_tests', label: 'Mock Tests' },
  { value: 'community', label: 'Community' },
];
