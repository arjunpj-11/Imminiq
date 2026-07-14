import { ROUTES } from '../../../../routes/config/route-paths';

export const SETTINGS_API_PATHS = {
  root: '/settings',
  account: '/settings/account',
  appearance: '/settings/appearance',
  notifications: '/settings/notifications',
  notificationQuietHours: '/settings/notifications/quiet-hours',
  notificationEmailDigest: '/settings/notifications/email-digest',
  privacy: '/settings/privacy',
  codeEditor: '/settings/code-editor',
  compiler: '/settings/compiler',
  aiBehavior: '/settings/ai-behavior',
  learningJourney: '/settings/learning-journey',
  gestures: '/settings/gestures',
  reset: '/settings/reset',
  securityOverview: '/security/overview',
  changeEmail: '/security/change-email',
  changePassword: '/security/change-password',
  session: (sessionId: string) => `/security/sessions/${sessionId}`,
  twoFactorSetup: '/security/2fa/setup',
  twoFactorVerify: '/security/2fa/verify',
  twoFactorDisable: '/security/2fa/disable',
  deleteAccount: '/security/delete-account',
} as const;

export const SETTINGS_TABS = [
  {
    label: 'Account Security',
    to: ROUTES.settingsSecurity,
  },
  {
    label: 'Notifications',
    to: ROUTES.settingsNotifications,
  },
  {
    label: 'Preferences',
    to: ROUTES.settingsPreferences,
  },
  {
    label: 'Privacy',
    to: ROUTES.settingsPrivacy,
  },
] as const;
