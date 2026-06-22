// apps/web/src/modules/community/hooks/useDebouncedValue.ts

import { useEffect, useState } from 'react'

export const useDebouncedValue = <TValue,>(
  value: TValue,
  delayMs = 350,
): TValue => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setDebouncedValue(value)
    }, delayMs)

    return () => window.clearTimeout(timerId)
  }, [delayMs, value])

  return debouncedValue
}