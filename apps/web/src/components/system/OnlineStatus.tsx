import { useEffect, useRef, useState } from 'react'

import { toast } from '../../lib/toast'

export default function OnlineStatus() {
  const [online, setOnline] = useState(() => navigator.onLine)
  const wasOffline = useRef(!navigator.onLine)

  useEffect(() => {
    const handleOffline = () => {
      wasOffline.current = true
      setOnline(false)
    }
    const handleOnline = () => {
      setOnline(true)
      if (wasOffline.current) {
        toast.success('You are back online', 'Live data can sync again.')
        wasOffline.current = false
      }
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)
    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  if (online) return null

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-190 flex min-h-8 items-center justify-center bg-(--warning) px-4 py-1.5 text-center text-[11px] font-bold text-[#1a1714] shadow-(--shadow-1)"
    >
      You are offline. Read-only content remains available; changes will need a connection.
    </div>
  )
}
