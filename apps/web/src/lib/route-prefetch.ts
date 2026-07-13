const routeLoaders: Record<string, () => Promise<unknown>> = {
  '/dashboard': () => import('../modules/user/dashboard/pages/DashboardPage'),
  '/trackers': () => import('../modules/user/trackers/pages/MyTrackersPage'),
  '/mock-tests': () => import('../modules/user/mock-tests/pages/MockTestsPage'),
  '/community': () => import('../modules/user/community/pages/CommunityBrowsePage'),
  '/leaderboard': () => import('../modules/user/leaderboard/pages/LeaderboardPage'),
  '/activity': () => import('../modules/user/activity/pages/ActivityPage'),
  '/friends': () => import('../modules/user/friends/pages/FriendsPage'),
  '/profile': () => import('../modules/user/users/pages/ProfilePage'),
  '/settings': () => import('../modules/user/settings/pages/PreferencesSettingsPage'),
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
