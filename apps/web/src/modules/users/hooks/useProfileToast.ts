import { useCallback, useRef, useState } from 'react'
import type { ToastTone } from '../../../types/profile.types'

export const useProfileToast = () => {
  const [message, setMessage] = useState('')
  const [visible, setVisible] = useState(false)
  const [tone, setTone] = useState<ToastTone>('info')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearToastTimer = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }, [])

  const show = useCallback(
    (msg: string, nextTone: ToastTone = 'info', duration = 2400) => {
      clearToastTimer()
      setMessage(msg)
      setTone(nextTone)
      setVisible(true)

      if (nextTone !== 'loading') {
        timer.current = setTimeout(() => setVisible(false), duration)
      }
    },
    [clearToastTimer]
  )

  const showLoading = useCallback(
    (msg: string) => {
      show(msg, 'loading', 0)
    },
    [show]
  )

  const hide = useCallback(() => {
    clearToastTimer()
    setVisible(false)
  }, [clearToastTimer])

  return { message, visible, tone, show, showLoading, hide }
}
