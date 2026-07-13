import {
  useEffect,
  useRef,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

import { cn } from '../../lib/cn'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import { canUseDOM } from '../../lib/storage/safe-storage'

interface IModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  titleId?: string
  descriptionId?: string
  ariaLabel?: string
  role?: 'dialog' | 'alertdialog'
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  preventClose?: boolean
  lockBodyScroll?: boolean
  portal?: boolean
  overlayClassName?: string
  contentClassName?: string
  initialFocusRef?: React.RefObject<HTMLElement | null>
}

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export default function Modal({
  open,
  onClose,
  children,
  titleId,
  descriptionId,
  ariaLabel = 'Dialog',
  role = 'dialog',
  closeOnBackdrop = true,
  closeOnEscape = true,
  preventClose = false,
  lockBodyScroll = true,
  portal = true,
  overlayClassName,
  contentClassName,
  initialFocusRef,
}: IModalProps) {
  const panelRef = useRef<HTMLElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open || !canUseDOM()) return

    previousFocusRef.current = document.activeElement as HTMLElement | null
    const frame = window.requestAnimationFrame(() => {
      const preferred = initialFocusRef?.current
      const firstFocusable = panelRef.current?.querySelector<HTMLElement>(focusableSelector)
      ;(preferred ?? firstFocusable ?? panelRef.current)?.focus()
    })

    return () => {
      window.cancelAnimationFrame(frame)
      previousFocusRef.current?.focus()
    }
  }, [initialFocusRef, open])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape && !preventClose) {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab' || !panelRef.current) return

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter((element) => !element.hasAttribute('disabled'))

      if (focusable.length === 0) {
        event.preventDefault()
        panelRef.current.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement

      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [closeOnEscape, onClose, open, preventClose])

  useBodyScrollLock(open && lockBodyScroll)

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
        'modal-backdrop-enter fixed inset-0 z-150 flex items-center justify-center bg-(--surface-overlay) p-4 backdrop-blur-sm',
        overlayClassName,
      )}
      onMouseDown={handleBackdropMouseDown}
    >
      <section
        ref={panelRef}
        tabIndex={-1}
        role={role}
        aria-modal="true"
        aria-label={titleId ? undefined : ariaLabel}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cn(
          'modal-panel-enter relative w-full max-w-md overflow-hidden rounded-xl border border-(--border-subtle) bg-(--surface-elevated) p-5 text-(--text-primary) shadow-(--shadow-3) outline-none',
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
