export const SETTINGS_ROUTE_PATHS = {
  ROOT: '/',

  APPEARANCE: '/appearance',
  NOTIFICATIONS: '/notifications',
  PRIVACY: '/privacy',
  PRIVACY_REQUESTS: '/privacy/requests',
  PRIVACY_REQUEST_DETAIL: '/privacy/requests/:requestId',
  RESET: '/reset',
} as const;

export type SettingsRoutePath = (typeof SETTINGS_ROUTE_PATHS)[keyof typeof SETTINGS_ROUTE_PATHS];
