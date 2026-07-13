export const DASHBOARD_ROUTE_PATHS = {
  SUMMARY: '/summary',
  CURRENT_ROADMAP: '/current-roadmap',
  ACTIVITY_INTENSITY: '/activity-intensity',
  RECENT_BATTLES: '/recent-battles',
  FRIENDS_HUB: '/friends-hub',
  RECOMMENDED_ACTIONS: '/recommended-actions',
  AI_INSIGHTS: '/ai-insights',
} as const

export type DashboardRoutePath =
  (typeof DASHBOARD_ROUTE_PATHS)[keyof typeof DASHBOARD_ROUTE_PATHS]