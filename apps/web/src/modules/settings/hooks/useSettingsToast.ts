import { useCallback, useEffect, useRef, useState } from 'react'
import type { ToastTone } from '../types/settings-ui.types'

export const useSettingsToast = () => {
  const [message, setMessage] = useState('')
  const [tone, setTone] = useState<ToastTone>('info')
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const showToast = useCallback(
    (nextMessage: string, nextTone: ToastTone = 'info') => {
      clearTimer()
      setMessage(nextMessage)
      setTone(nextTone)
      setVisible(true)

      if (nextTone !== 'loading') {
        timerRef.current = setTimeout(() => {
          setVisible(false)
        }, 2400)
      }
    },
    [clearTimer]
  )

  const hideToast = useCallback(() => {
    clearTimer()
    setVisible(false)
  }, [clearTimer])

  useEffect(() => clearTimer, [clearTimer])

  return {
    message,
    tone,
    visible,
    showToast,
    hideToast,
  }
}
