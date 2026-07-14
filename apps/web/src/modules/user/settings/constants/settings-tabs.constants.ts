import { ROUTES } from '../../../../routes/config/route-paths';

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
