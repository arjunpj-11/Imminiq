import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { AppPageSkeleton } from '../feedback/RouteSkeleton';
import AppErrorBoundary from '../system/AppErrorBoundary';
import { AppShell } from './AppShell';

export default function AuthenticatedAppLayout() {
  const location = useLocation();

  return (
    <AppShell>
      <AppErrorBoundary resetKey={location.pathname}>
        <div key={location.pathname} className="route-enter min-w-0">
          <Suspense fallback={<AppPageSkeleton />}>
            <Outlet />
          </Suspense>
        </div>
      </AppErrorBoundary>
    </AppShell>
  );
}
