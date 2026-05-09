import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}