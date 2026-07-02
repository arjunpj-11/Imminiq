import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { safeSessionStorage } from '../../lib/storage/safe-storage'
import { STORAGE_KEYS } from '../../lib/storage/storage-keys'

export default function NetworkRedirector() {
  const navigate = useNavigate()
  const location = useLocation()

  const currentPathRef = useRef(
    `${location.pathname}${location.search}${location.hash}`
  )

  /**
   * Always keep the latest route stored,
   * without triggering offline redirect checks on every navigation.
   */
  useEffect(() => {
    currentPathRef.current =
      `${location.pathname}${location.search}${location.hash}`
  }, [location.pathname, location.search, location.hash])

  /**
   * Only redirect when the browser fires a real "offline" event.
   */
  useEffect(() => {
    const handleOffline = () => {
      const currentPath = currentPathRef.current

      if (currentPath.startsWith('/offline')) {
        return
      }

      safeSessionStorage.set(STORAGE_KEYS.lastOnlinePath, currentPath)

      navigate('/offline', {
        replace: true,
      })
    }

    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('offline', handleOffline)
    }
  }, [navigate])

  return null
}