import { ROUTES } from '../routes/config/route-paths';

const routeLoaders: Record<string, () => Promise<unknown>> = {
  [ROUTES.dashboard]: () => import('../modules/user/dashboard/pages/DashboardPage'),
  [ROUTES.trackers]: () => import('../modules/user/trackers/pages/MyTrackersPage'),
  [ROUTES.mockTests]: () => import('../modules/user/mock-tests/pages/MockTestsPage'),
  [ROUTES.learningAgent]: () =>
    import('../modules/user/adaptive-learning/pages/AdaptiveLearningPage'),
  [ROUTES.community]: () => import('../modules/user/community/pages/CommunityBrowsePage'),
  [ROUTES.leaderboard]: () => import('../modules/user/leaderboard/pages/LeaderboardPage'),
  [ROUTES.activity]: () => import('../modules/user/activity/pages/ActivityPage'),
  [ROUTES.friends]: () => import('../modules/user/friends/pages/FriendsPage'),
  [ROUTES.profile]: () => import('../modules/user/users/pages/ProfilePage'),
  [ROUTES.settingsRoot]: () => import('../modules/user/settings/pages/PreferencesSettingsPage'),
};

const prefetched = new Set<string>();

export const prefetchRoute = (path: string) => {
  const route = Object.keys(routeLoaders)
    .sort((a, b) => b.length - a.length)
    .find((candidate) => path === candidate || path.startsWith(`${candidate}/`));

  if (!route || prefetched.has(route)) return;
  prefetched.add(route);
  void routeLoaders[route]().catch(() => prefetched.delete(route));
};
