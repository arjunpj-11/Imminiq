import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuthStore } from '../../store/useAuthStore';
import { ADMIN_ROUTES } from '../config/route-paths';
import type { AuthRole } from '../../lib/auth-roles';

export function AdminRoleGate({
  children,
  roles,
}: {
  children: ReactNode;
  roles: readonly AuthRole[];
}) {
  const role = useAuthStore((state) => state.user?.role);
  return role && roles.includes(role) ? (
    <>{children}</>
  ) : (
    <Navigate to={ADMIN_ROUTES.dashboard} replace />
  );
}
