import { useCallback, useRef } from 'react'

import { toast as globalToast } from '../../../../lib/toast'
import type { ToastTone } from '../../types/profile.types'

const toneFor = (tone: ToastTone) =>
  tone === 'loading' ? 'info' : tone

/** Root-toast adapter retained behind the existing profile hook API. */
export const useProfileToast = () => {
  const activeToastId = useRef<number | null>(null)

  const show = useCallback(
    (message: string, tone: ToastTone = 'info', duration = 2400) => {
      const input = {
        title: message,
        tone: toneFor(tone),
        duration: tone === 'loading' ? 0 : duration,
      } as const

      if (activeToastId.current !== null) {
        globalToast.update(activeToastId.current, input)
      } else {
        activeToastId.current = globalToast.show(input)
      }

      if (tone !== 'loading') activeToastId.current = null
    },
    [],
  )

  const showLoading = useCallback((message: string) => show(message, 'loading', 0), [show])

  const hide = useCallback(() => {
    if (activeToastId.current !== null) {
      globalToast.dismiss(activeToastId.current)
      activeToastId.current = null
    }
  }, [])

  return {
    message: '',
    visible: false,
    tone: 'info' as ToastTone,
    show,
    showLoading,
    hide,
  }
}
