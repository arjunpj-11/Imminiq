import { useEffect } from 'react'

import { cn } from '../utils/tracker-ui'

type ConfirmDialogVariant = 'danger' | 'default'

type ConfirmDialogProps = {
  open: boolean
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
  variant?: ConfirmDialogVariant
  onConfirm: () => void
  onClose: () => void
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  variant = 'default',
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isLoading) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => window.removeEventListener('keydown', handleEscape)
  }, [open, isLoading, onClose])

  if (!open) return null

  const isDanger = variant === 'danger'

  return (
    <div
      className="fixed inset-0 z-150 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <button
        type="button"
        aria-label="Close confirmation dialog"
        disabled={isLoading}
        onClick={onClose}
        className="absolute inset-0 cursor-default disabled:cursor-wait"
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 text-[#1a1714] shadow-[0_24px_80px_rgba(0,0,0,0.28)] dark:border-white/10 dark:bg-[#1e1c19] dark:text-[#f2f0eb]">
        <div className="mb-4 flex items-start gap-3">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-[18px]',
              isDanger
                ? 'border-red-400/40 bg-red-500/10 text-red-500 dark:border-red-400/30 dark:text-red-400'
                : 'border-[#e0d0c5] bg-white/70 text-[#b84c2b] dark:border-white/9 dark:bg-white/5 dark:text-[#e8816a]'
            )}
          >
            {isDanger ? '!' : '?'}
          </div>

          <div className="min-w-0">
            <h3
              id="confirm-dialog-title"
              className="text-[16px] font-bold leading-tight text-[#1a1714] dark:text-[#f2f0eb]"
            >
              {title}
            </h3>

            <p
              id="confirm-dialog-description"
              className="mt-1.5 text-[13px] leading-relaxed text-[#6b5f58] dark:text-[#9b9a92]"
            >
              {description}
            </p>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-full border border-[#e0d0c5] px-4 py-2 font-['DM_Mono',monospace] text-[10px] font-bold uppercase tracking-[0.08em] text-[#6b5f58] transition hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/9 dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              'rounded-full border px-4 py-2 font-["DM_Mono",monospace] text-[10px] font-bold uppercase tracking-[0.08em] transition disabled:cursor-wait disabled:opacity-60',
              isDanger
                ? 'border-red-400 bg-red-500 text-white hover:bg-red-600 dark:border-red-400/70 dark:bg-red-500 dark:hover:bg-red-600'
                : 'border-[#b84c2b] bg-[#b84c2b] text-white hover:bg-[#9f3f24] dark:border-[#e8816a] dark:bg-[#e8816a] dark:text-[#1a1714] dark:hover:bg-[#f0957e]'
            )}
          >
            {isLoading ? 'Please wait...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}