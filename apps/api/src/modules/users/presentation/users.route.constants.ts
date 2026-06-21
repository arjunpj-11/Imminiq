export const USER_ROUTE_PATHS = {
  PUBLIC_PROFILE: '/:username/public-profile',

  ME: '/me',
  MY_STATS: '/me/stats',
  MY_ACTIVITY: '/me/activity',
  MY_RECENT_ACTIVITY: '/me/recent-activity',
  MY_STREAK: '/me/streak',
  MY_PUBLISHED_TRACKERS: '/me/published-trackers',
  MY_BADGES: '/me/badges',
} as const

export type UserRoutePath =
  (typeof USER_ROUTE_PATHS)[keyof typeof USER_ROUTE_PATHS]