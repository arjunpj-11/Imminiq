import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../modules/auth/store/useAuthStore'
import AuthLoadingScreen from '../components/ui/AuthLoadingScreen'

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((state) => state.user)
  const authReady = useAuthStore((state) => state.authReady)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!authReady) {
    return <AuthLoadingScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (
  user?.status === 'blocked' ||
  user?.status === 'banned' ||
  user?.status === 'deactivated' ||
  user?.status === 'paused'
) {
  return <Navigate to="/blocked" replace />
}

  return ['admin', 'superadmin'].includes(user?.role ?? '') ? (
    <>{children}</>
  ) : (
    <Navigate to="/dashboard" replace />
  )
}