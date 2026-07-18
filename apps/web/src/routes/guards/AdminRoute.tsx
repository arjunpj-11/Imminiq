import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { RouteSkeleton } from '../../components/feedback/RouteSkeleton';
import { useAuthStore } from '../../store/useAuthStore';
import { ROUTES } from '../config/route-paths';

interface IAdminRouteProps {
  children?: ReactNode;
}

export function AdminRoute({ children }: IAdminRouteProps) {
  const user = useAuthStore((state) => state.user);
  const authReady = useAuthStore((state) => state.authReady);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!authReady) return <RouteSkeleton withChrome />;
  if (!isAuthenticated || !user) return <Navigate to={ROUTES.login} replace />;

  if (
    user.status === 'blocked' ||
    user.status === 'banned' ||
    user.status === 'deactivated' ||
    user.status === 'paused'
  ) {
    return <Navigate to={ROUTES.blocked} replace />;
  }

  if (!['moderator', 'admin', 'superadmin'].includes(user.role)) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
