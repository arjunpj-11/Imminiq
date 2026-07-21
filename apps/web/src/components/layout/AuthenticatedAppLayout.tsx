import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { AppPageSkeleton } from '../feedback/RouteSkeleton';
import AppErrorBoundary from '../system/AppErrorBoundary';
import { ROUTES } from '../../routes/config/route-paths';
import { AppShell } from './AppShell';

export default function AuthenticatedAppLayout() {
  const location = useLocation();
  const routeAnimationKey = location.pathname.startsWith(ROUTES.settingsRoot)
    ? ROUTES.settingsRoot
    : location.pathname;

  return (
    <AppShell>
      <AppErrorBoundary resetKey={location.pathname}>
        <div key={routeAnimationKey} className="route-enter min-w-0">
          <Suspense fallback={<AppPageSkeleton />}>
            <Outlet />
          </Suspense>
        </div>
      </AppErrorBoundary>
    </AppShell>
  );
}
