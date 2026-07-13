import { useCallback, useRef } from 'react'
import type { SubmitActionKey } from '../../types/profile.types'

export const useSubmitRateLimit = (cooldownMs = 1800) => {
  const lastRequestAt = useRef<Partial<Record<SubmitActionKey, number>>>({})
  const inFlight = useRef<Set<SubmitActionKey>>(new Set())

  const canStart = useCallback(
    (key: SubmitActionKey) => {
      const now = Date.now()
      const previous = lastRequestAt.current[key] ?? 0

      if (inFlight.current.has(key) || now - previous < cooldownMs) {
        return false
      }

      inFlight.current.add(key)
      lastRequestAt.current[key] = now
      return true
    },
    [cooldownMs]
  )

  const finish = useCallback((key: SubmitActionKey) => {
    inFlight.current.delete(key)
  }, [])

  return { canStart, finish }
}
