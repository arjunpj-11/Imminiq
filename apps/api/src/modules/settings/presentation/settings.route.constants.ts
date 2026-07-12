export const SETTINGS_ROUTE_PATHS = {
  ROOT: '/',

  APPEARANCE: '/appearance',
  NOTIFICATIONS: '/notifications',
  PRIVACY: '/privacy',
  GESTURES: '/gestures',

  ACCOUNT: '/account',

  NOTIFICATION_QUIET_HOURS: '/notifications/quiet-hours',
  NOTIFICATION_EMAIL_DIGEST: '/notifications/email-digest',

  CODE_EDITOR: '/code-editor',
  COMPILER: '/compiler',
  AI_BEHAVIOR: '/ai-behavior',
  LEARNING_JOURNEY: '/learning-journey',

  RESET: '/reset',
} as const

export type SettingsRoutePath =
  (typeof SETTINGS_ROUTE_PATHS)[keyof typeof SETTINGS_ROUTE_PATHS]
