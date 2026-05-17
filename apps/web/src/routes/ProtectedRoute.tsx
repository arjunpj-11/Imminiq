import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import AuthLoadingScreen from '../components/ui/AuthLoadingScreen'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const authReady = useAuthStore((state) => state.authReady)

  if (!authReady) {
    return <AuthLoadingScreen />
  }

  if (
  user?.status === 'blocked' ||
  user?.status === 'banned' ||
  user?.status === 'deactivated' ||
  user?.status === 'paused'
) {
  return <Navigate to="/blocked" replace />
}

  if (!user || !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}