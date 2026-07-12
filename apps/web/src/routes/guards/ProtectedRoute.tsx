import type { ReactNode } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

import AuthLoadingScreen from '../../components/ui/AuthLoadingScreen'
import { useAuthStore } from '../../store/useAuthStore'

interface IProtectedRouteProps {
  children?: ReactNode
}

const isRestrictedStatus = (status?: string) =>
  status === 'blocked' ||
  status === 'banned' ||
  status === 'deactivated' ||
  status === 'paused'

export function ProtectedRoute({ children }: IProtectedRouteProps) {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const authReady = useAuthStore((state) => state.authReady)

  if (!authReady) return <AuthLoadingScreen />
  if (isRestrictedStatus(user?.status)) return <Navigate to="/blocked" replace />
  if (!user || !isAuthenticated) return <Navigate to="/login" replace />

  return children ? <>{children}</> : <Outlet />
}
