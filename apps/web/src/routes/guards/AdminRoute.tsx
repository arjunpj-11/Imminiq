import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import AuthLoadingScreen from '../../components/feedback/AuthLoadingScreen';
import { useSecurityOverview } from '../../modules/user/settings/hooks/useSecuritySettings';
import { useAuthStore } from '../../store/useAuthStore';
import { ROUTES } from '../config/route-paths';

interface IAdminRouteProps {
  children?: ReactNode;
}

export function AdminRoute({ children }: IAdminRouteProps) {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const authReady = useAuthStore((state) => state.authReady);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isStaff = Boolean(
    user && ['moderator', 'admin', 'superadmin'].includes(user.role)
  );
  const securityQuery = useSecurityOverview({
    enabled: Boolean(authReady && isAuthenticated && isStaff),
  });

  if (!authReady) return <AuthLoadingScreen />;
  if (!isAuthenticated || !user) return <Navigate to={ROUTES.login} replace />;

  if (
    user.status === 'blocked' ||
    user.status === 'banned' ||
    user.status === 'deactivated' ||
    user.status === 'paused'
  ) {
    return <Navigate to={ROUTES.blocked} replace />;
  }

  if (!isStaff) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  if (!securityQuery.data && (securityQuery.isLoading || securityQuery.isFetching)) {
    return <AuthLoadingScreen />;
  }

  if (!securityQuery.data?.twoFactorEnabled) {
    const returnTo = `${location.pathname}${location.search}`;
    const enrollmentUrl = `${ROUTES.settingsSecurity}?staff2fa=required&returnTo=${encodeURIComponent(returnTo)}`;
    return <Navigate to={enrollmentUrl} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
