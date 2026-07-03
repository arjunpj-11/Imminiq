import { useCallback, useEffect, useState } from 'react'

import { safeLocalStorage } from '../../../lib/storage/safe-storage'
import { STORAGE_KEYS } from '../../../lib/storage/storage-keys'
import { normalizeEmail } from '../utils/security-settings.utils'

export interface PendingEmailTimer {
  email: string
  expiresAt: number
}

const EMAIL_CHANGE_EXPIRY_MS = 10 * 60 * 1000

const getSecondsRemaining = (
  expiresAt: number,
  currentTime = Date.now(),
): number => {
  return Math.max(0, Math.ceil((expiresAt - currentTime) / 1000))
}

const readPendingEmailTimer = (): PendingEmailTimer | null => {
  const raw = safeLocalStorage.get(
    STORAGE_KEYS.pendingEmailChangeTimer,
  )

  if (!raw) {
    return null
  }

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

  const [currentTime, setCurrentTime] = useState(() => Date.now())

  const secondsLeft = timer
    ? getSecondsRemaining(timer.expiresAt, currentTime)
    : 0

  useEffect(() => {
    if (!timer) {
      return undefined
    }

    const intervalId = window.setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [timer])

  const start = useCallback((email: string) => {
    const now = Date.now()

    const nextTimer: PendingEmailTimer = {
      email: normalizeEmail(email),
      expiresAt: now + EMAIL_CHANGE_EXPIRY_MS,
    }

    safeLocalStorage.set(
      STORAGE_KEYS.pendingEmailChangeTimer,
      JSON.stringify(nextTimer),
    )

    setTimer(nextTimer)
    setCurrentTime(now)
  }, [])

  return {
    timer,
    secondsLeft,
    start,
  }
}