export const ACTIVITY_CATEGORIES = [
  'tracker',
  'mock_test',
  'community',
  'streak',
  'xp_milestone',
] as const;

export type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number];

export const ACTIVITY_FEED_FILTERS = ['all', 'trackers', 'mock_tests', 'community'] as const;

export type ActivityFeedFilter = (typeof ACTIVITY_FEED_FILTERS)[number];

export const activityCategoriesForFilter = (
  filter: ActivityFeedFilter
): ActivityCategory[] | undefined => {
  switch (filter) {
    case 'trackers':
      return ['tracker'];
    case 'mock_tests':
      return ['mock_test'];
    case 'community':
      return ['community'];
    case 'all':
      return undefined;
  }
};
