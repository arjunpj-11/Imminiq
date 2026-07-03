import { useEffect, useState } from 'react'

export function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds)

  useEffect(() => {
    const intervalId = window.setInterval(
      () => setSeconds((current) => Math.max(0, current - 1)),
      1000,
    )

    return () => window.clearInterval(intervalId)
  }, [])

  const hours = String(Math.floor(seconds / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
  const remainingSeconds = String(seconds % 60).padStart(2, '0')

  return `${hours}:${minutes}:${remainingSeconds}`
}
