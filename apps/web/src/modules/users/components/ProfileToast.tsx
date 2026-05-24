import type { ToastTone } from '../../../types/profile.types'
import { cn } from '../utils/profile-ui.utils'

interface ProfileToastProps {
  message: string
  visible: boolean
  tone: ToastTone
}

export default function ProfileToast({ message, visible, tone }: ProfileToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'pointer-events-none fixed bottom-[calc(72px+env(safe-area-inset-bottom,0))] right-4 z-200 flex max-w-[min(360px,calc(100vw-32px))] items-center gap-2.5 rounded-[14px] border px-4 py-3 text-[13px] font-semibold shadow-[0_18px_56px_rgba(0,0,0,0.32)] backdrop-blur-xl transition-all duration-250 lg:bottom-7 lg:right-7',
        tone === 'error'
          ? 'border-[rgba(224,82,82,0.22)] bg-[#2c1717]/95 text-[#ffd5d5] dark:bg-[#2c1717]/95 dark:text-[#ffd5d5]'
          : tone === 'success'
            ? 'border-[rgba(76,175,125,0.24)] bg-[#173022]/95 text-[#dbffe8] dark:bg-[#173022]/95 dark:text-[#dbffe8]'
            : 'border-[rgba(184,76,43,0.22)] bg-[#1a1714]/95 text-[#f5ede4] dark:border-[rgba(232,129,106,0.28)] dark:bg-[#f2f0eb]/95 dark:text-[#1a1714]',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
      )}
    >
      {tone === 'loading' && (
        <span className="h-3.75 w-3.75 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      <span className="min-w-0 leading-[1.4]">{message}</span>
    </div>
  )
}
