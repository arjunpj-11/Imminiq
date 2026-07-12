import { useLocation } from 'react-router-dom'

import { useAuthSync } from '../../hooks/auth/useAuthSync'
import { useRestoreSession } from '../../hooks/auth/useRestoreSession'
import { isPublicRoute } from '../config/route-paths'

function AuthSessionSync() {
  useRestoreSession()
  useAuthSync()
  return null
}

export default function AuthSessionBridge() {
  const location = useLocation()
  return isPublicRoute(location.pathname) ? null : <AuthSessionSync />
}
