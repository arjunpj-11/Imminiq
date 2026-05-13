import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
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

  return ['admin', 'superadmin'].includes(user?.role ?? '') ? (
    <>{children}</>
  ) : (
    <Navigate to="/dashboard" replace />
  )
}