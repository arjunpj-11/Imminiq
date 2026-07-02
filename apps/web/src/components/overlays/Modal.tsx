import {
  useEffect,
  useId,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

import { cn } from '../../lib/cn'
import { canUseDOM } from '../../lib/storage/safe-storage'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  titleId?: string
  descriptionId?: string
  role?: 'dialog' | 'alertdialog'
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  preventClose?: boolean
  lockBodyScroll?: boolean
  portal?: boolean
  overlayClassName?: string
  contentClassName?: string
}

export default function Modal({
  open,
  onClose,
  children,
  titleId,
  descriptionId,
  role = 'dialog',
  closeOnBackdrop = true,
  closeOnEscape = true,
  preventClose = false,
  lockBodyScroll = true,
  portal = true,
  overlayClassName,
  contentClassName,
}: ModalProps) {
  const generatedId = useId()
  const resolvedTitleId = titleId ?? `modal-title-${generatedId}`

  useEffect(() => {
    if (!open || !closeOnEscape) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !preventClose) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [closeOnEscape, onClose, open, preventClose])

  useEffect(() => {
    if (!open || !lockBodyScroll || !canUseDOM()) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [lockBodyScroll, open])

  if (!open) return null

  const handleBackdropMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (
      closeOnBackdrop &&
      !preventClose &&
      event.target === event.currentTarget
    ) {
      onClose()
    }
  }

  const content = (
    <div
      className={cn(
        'fixed inset-0 z-150 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm',
        overlayClassName,
      )}
      onMouseDown={handleBackdropMouseDown}
    >
      <section
        role={role}
        aria-modal="true"
        aria-labelledby={resolvedTitleId}
        aria-describedby={descriptionId}
        className={cn(
          'relative w-full max-w-md overflow-hidden rounded-3xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 text-[#1a1714] shadow-[0_24px_80px_rgba(0,0,0,0.28)] dark:border-white/10 dark:bg-[#1e1c19] dark:text-[#f2f0eb]',
          contentClassName,
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {children}
      </section>
    </div>
  )

  return portal && canUseDOM() ? createPortal(content, document.body) : content
}
