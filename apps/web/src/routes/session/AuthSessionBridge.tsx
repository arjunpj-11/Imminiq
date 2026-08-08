import { useLocation } from 'react-router';

import { useAuthSync } from '../../hooks/auth/useAuthSync';
import { useRestoreSession } from '../../hooks/auth/useRestoreSession';
import { isPublicRoute, ROUTES } from '../config/route-paths';

function AuthSessionSync() {
  useRestoreSession();
  useAuthSync();
  return null;
}

export default function AuthSessionBridge() {
  const location = useLocation();
  const isPublicProfile = location.pathname.startsWith(`${ROUTES.profile}/`);
  const isLandingPage = location.pathname === ROUTES.home;

  return isPublicRoute(location.pathname) && !isPublicProfile && !isLandingPage ? null : (
    <AuthSessionSync />
  );
}
