export type FeatureKey =
  | 'trackers'
  | 'trackerCreation'
  | 'community'
  | 'leaderboard'
  | 'mockTests'
  | 'adaptiveLearning'
  | 'social'
  | 'calls'
  | 'subscriptions'
  | 'supportTickets'
  | 'activity'
  | 'savedItems';

export type FeatureAvailability = Record<FeatureKey, boolean>;

export const FEATURE_AVAILABILITY_DEFAULTS: FeatureAvailability = {
  trackers: true,
  trackerCreation: true,
  community: true,
  leaderboard: true,
  mockTests: true,
  adaptiveLearning: true,
  social: true,
  calls: true,
  subscriptions: true,
  supportTickets: true,
  activity: true,
  savedItems: true,
};

/** Fail closed in navigation and actions until the authenticated policy is loaded. */
export const FEATURE_AVAILABILITY_SAFE_FALLBACK: FeatureAvailability = {
  trackers: false,
  trackerCreation: false,
  community: false,
  leaderboard: false,
  mockTests: false,
  adaptiveLearning: false,
  social: false,
  calls: false,
  subscriptions: false,
  supportTickets: false,
  activity: false,
  savedItems: false,
};

export const FEATURE_LABELS: Record<FeatureKey, string> = {
  trackers: 'Trackers',
  trackerCreation: 'Tracker creation',
  community: 'Community',
  leaderboard: 'Leaderboard',
  mockTests: 'Mock tests',
  adaptiveLearning: 'Ask Immi',
  social: 'Social',
  calls: 'Voice and video calls',
  subscriptions: 'Subscriptions',
  supportTickets: 'Support tickets',
  activity: 'Activity',
  savedItems: 'Saved items',
};

export const getRequiredFeaturesForPath = (pathname: string): readonly FeatureKey[] => {
  const path = pathname.split(/[?#]/, 1)[0] ?? pathname;
  if (path.startsWith('/trackers/create') || path.startsWith('/onboarding/')) {
    return ['trackers', 'trackerCreation'];
  }
  if (path.startsWith('/trackers')) return ['trackers'];
  if (path.startsWith('/community') || path === '/verify-and-earn') {
    return ['community'];
  }
  if (path.startsWith('/leaderboard')) return ['leaderboard'];
  if (path.startsWith('/mock-tests')) return ['mockTests'];
  if (path === '/learning-agent') return ['adaptiveLearning'];
  if (path === '/chat' || path.startsWith('/friends')) return ['social'];
  if (path === '/pricing') return ['subscriptions'];
  if (path === '/support') return ['supportTickets'];
  if (path === '/activity') return ['activity'];
  if (path === '/saved') return ['savedItems'];
  return [];
};

export const isPathAvailable = (pathname: string, features: FeatureAvailability) =>
  getRequiredFeaturesForPath(pathname).every((feature) => features[feature]);
