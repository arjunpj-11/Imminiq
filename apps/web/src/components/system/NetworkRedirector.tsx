import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

import { safeSessionStorage } from '../../lib/storage/safe-storage'
import { STORAGE_KEYS } from '../../lib/storage/storage-keys'

/**
 * Keeps the last usable route so the offline page can return users to their
 * work, while OnlineStatus provides a non-disruptive connection banner.
 */
export default function NetworkRedirector() {
  const location = useLocation()
  const currentPathRef = useRef(
    `${location.pathname}${location.search}${location.hash}`,
  )

  useEffect(() => {
    currentPathRef.current =
      `${location.pathname}${location.search}${location.hash}`
  }, [location.hash, location.pathname, location.search])

  useEffect(() => {
    const handleOffline = () => {
      const currentPath = currentPathRef.current
      if (!currentPath.startsWith('/offline')) {
        safeSessionStorage.set(STORAGE_KEYS.lastOnlinePath, currentPath)
      }
    }

    window.addEventListener('offline', handleOffline)
    return () => window.removeEventListener('offline', handleOffline)
  }, [])

  return null
}
