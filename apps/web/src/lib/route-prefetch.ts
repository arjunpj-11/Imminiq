const routeLoaders: Record<string, () => Promise<unknown>> = {
  '/dashboard': () => import('../modules/dashboard/pages/DashboardPage'),
  '/trackers': () => import('../modules/trackers/pages/MyTrackersPage'),
  '/mock-tests': () => import('../modules/mock-tests/pages/MockTestsPage'),
  '/community': () => import('../modules/community/pages/CommunityBrowsePage'),
  '/leaderboard': () => import('../modules/leaderboard/pages/LeaderboardPage'),
  '/activity': () => import('../modules/activity/pages/ActivityPage'),
  '/friends': () => import('../modules/friends/pages/FriendsPage'),
  '/profile': () => import('../modules/users/pages/ProfilePage'),
  '/settings': () => import('../modules/settings/pages/PreferencesSettingsPage'),
}

const prefetched = new Set<string>()

export const prefetchRoute = (path: string) => {
  const route = Object.keys(routeLoaders)
    .sort((a, b) => b.length - a.length)
    .find((candidate) => path === candidate || path.startsWith(`${candidate}/`))

  if (!route || prefetched.has(route)) return
  prefetched.add(route)
  void routeLoaders[route]().catch(() => prefetched.delete(route))
}
