import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router';

import { AppPageSkeleton } from '../feedback/RouteSkeleton';
import AppErrorBoundary from '../system/AppErrorBoundary';
import { ROUTES } from '../../routes/config/route-paths';
import { AppShell } from './AppShell';

import ConfettiCanvas from '../ui/ConfettiCanvas';

export default function AuthenticatedAppLayout() {
  const location = useLocation();
  const isOpenSocialConversation =
    location.pathname === ROUTES.chat &&
    new URLSearchParams(location.search).has('conversation');
  const routeAnimationKey = location.pathname.startsWith(ROUTES.settingsRoot)
    ? ROUTES.settingsRoot
    : location.pathname;

  return (
    <AppShell withFooter={!isOpenSocialConversation}>
      <ConfettiCanvas />
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
