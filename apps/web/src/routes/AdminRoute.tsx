import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((s) => s.user)
  return ['admin', 'superadmin'].includes(user?.role ?? '')
    ? <>{children}</>
    : <Navigate to="/dashboard" replace />
}