// apps/web/src/hooks/auth/useAuthSync.ts

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'

type AuthSyncPayload = {
  type?: 'EMAIL_CHANGED_LOGOUT'
  timestamp?: number
}

export const useAuthSync = () => {
  const navigate = useNavigate()
  const clearUser = useAuthStore((state) => state.clearUser)

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== 'imminiq-auth-sync' || !event.newValue) {
        return
      }

      try {
        const payload = JSON.parse(event.newValue) as AuthSyncPayload

        if (payload.type === 'EMAIL_CHANGED_LOGOUT') {
          clearUser()
          navigate('/login', { replace: true })
        }
      } catch {
        // ignore malformed sync event
      }
    }

    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('storage', handleStorage)
    }
  }, [clearUser, navigate])
}