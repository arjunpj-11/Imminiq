import { useCallback, useEffect, useState } from 'react'

import { safeLocalStorage } from '../../../lib/storage/safe-storage'
import { STORAGE_KEYS } from '../../../lib/storage/storage-keys'
import { normalizeEmail } from '../utils/security-settings.utils'

export interface PendingEmailTimer {
  email: string
  expiresAt: number
}

const EMAIL_CHANGE_EXPIRY_MS = 10 * 60 * 1000

const getSecondsRemaining = (expiresAt: number) =>
  Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000))

const readPendingEmailTimer = (): PendingEmailTimer | null => {
  const raw = safeLocalStorage.get(STORAGE_KEYS.pendingEmailChangeTimer)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as PendingEmailTimer

    if (
      typeof parsed?.email !== 'string' ||
      typeof parsed?.expiresAt !== 'number'
    ) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export function usePendingEmailChangeTimer() {
  const [timer, setTimer] = useState<PendingEmailTimer | null>(
    readPendingEmailTimer,
  )
  const [secondsLeft, setSecondsLeft] = useState(() =>
    timer ? getSecondsRemaining(timer.expiresAt) : 0,
  )

  useEffect(() => {
    if (!timer) {
      setSecondsLeft(0)
      return
    }

    const updateCountdown = () => {
      setSecondsLeft(getSecondsRemaining(timer.expiresAt))
    }

    updateCountdown()
    const intervalId = window.setInterval(updateCountdown, 1000)
    return () => window.clearInterval(intervalId)
  }, [timer])

  const start = useCallback((email: string) => {
    const nextTimer: PendingEmailTimer = {
      email: normalizeEmail(email),
      expiresAt: Date.now() + EMAIL_CHANGE_EXPIRY_MS,
    }

    safeLocalStorage.set(
      STORAGE_KEYS.pendingEmailChangeTimer,
      JSON.stringify(nextTimer),
    )
    setTimer(nextTimer)
    setSecondsLeft(getSecondsRemaining(nextTimer.expiresAt))
  }, [])

  return { timer, secondsLeft, start }
}
