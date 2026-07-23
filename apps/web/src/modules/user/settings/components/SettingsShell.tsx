import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import PageHeader from '../../../../components/layout/PageHeader';
import { ROUTES } from '../../../../routes/config/route-paths';
import SettingsContentLoading from './SettingsContentLoading';
import SettingsTabs from './SettingsTabs';

const SETTINGS_PAGE_META = {
  [ROUTES.settingsSecurity]: {
    title: 'Account Security',
    description:
      'Manage your email, password, sessions, two-factor authentication and account safety.',
    loadingVariant: 'security',
    loadingTitle: 'Preparing account security',
  },
  [ROUTES.settingsNotifications]: {
    title: 'Notifications',
    description: 'Control the notifications Imminiq currently supports.',
    loadingVariant: 'notifications',
    loadingTitle: 'Preparing notification controls',
  },
  [ROUTES.settingsPreferences]: {
    title: 'Preferences',
    description: 'Choose how Imminiq looks on this device.',
    loadingVariant: 'appearance',
    loadingTitle: 'Preparing appearance',
  },
  [ROUTES.settingsPrivacy]: {
    title: 'Privacy',
    description: 'Control the profile information other learners can see.',
    loadingVariant: 'privacy',
    loadingTitle: 'Preparing privacy controls',
  },
} as const;

export default function SettingsShell() {
  const location = useLocation();
  const meta =
    SETTINGS_PAGE_META[location.pathname as keyof typeof SETTINGS_PAGE_META] ??
    SETTINGS_PAGE_META[ROUTES.settingsSecurity];

  return (
    <section className="px-4 pb-28 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-295">
        <PageHeader eyebrow="Settings" title={meta.title} description={meta.description} />
        <div className="mt-6">
          <SettingsTabs />
        </div>

        <div className="min-w-0" aria-live="polite">
          <Suspense
            fallback={
              <SettingsContentLoading variant={meta.loadingVariant} title={meta.loadingTitle} />
            }
          >
            <Outlet />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
