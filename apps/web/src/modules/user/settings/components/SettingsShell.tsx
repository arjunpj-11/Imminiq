import type { ReactNode } from 'react';

import { AppShellBoundary } from '../../../../components/layout/AppShell';
import PageHeader from '../../../../components/layout/PageHeader';
import SettingsTabs from './SettingsTabs';

interface ISettingsShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function SettingsShell({ title, subtitle, children }: ISettingsShellProps) {
  return (
    <AppShellBoundary>
      <section className="px-4 pb-28 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-295">
          <PageHeader eyebrow="Settings" title={title} description={subtitle} />
          <div className="mt-6">
            <SettingsTabs />
          </div>
          {children}
        </div>
      </section>
    </AppShellBoundary>
  );
}
