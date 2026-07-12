import type { ReactNode } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

import AuthLoadingScreen from '../../components/ui/AuthLoadingScreen'
import { useAuthStore } from '../../store/useAuthStore'

interface IAdminRouteProps {
  children?: ReactNode
}

export function AdminRoute({ children }: IAdminRouteProps) {
  const user = useAuthStore((state) => state.user)
  const authReady = useAuthStore((state) => state.authReady)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!authReady) return <AuthLoadingScreen />
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />

  if (
    user.status === 'blocked' ||
    user.status === 'banned' ||
    user.status === 'deactivated' ||
    user.status === 'paused'
  ) {
    return <Navigate to="/blocked" replace />
  }

  if (!['admin', 'superadmin'].includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children ? <>{children}</> : <Outlet />
}
