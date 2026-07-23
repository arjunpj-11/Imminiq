import { type MouseEvent as ReactMouseEvent, type ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface IAdminModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  preventClose?: boolean;
  ariaLabel?: string;
  contentClassName?: string;
}

let nextModalId = 0;
const modalStack: number[] = [];
let bodyLockCount = 0;
let originalBodyOverflow = '';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export default function AdminModal({
  open,
  onClose,
  children,
  preventClose = false,
  ariaLabel = 'Admin dialog',
  contentClassName = '',
}: IAdminModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const modalId = useRef(++nextModalId);
  const onCloseRef = useRef(onClose);
  const preventCloseRef = useRef(preventClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    preventCloseRef.current = preventClose;
  }, [preventClose]);

  useEffect(() => {
    if (!open) return;

    previousActiveElement.current = document.activeElement as HTMLElement | null;
    const currentModalId = modalId.current;
    modalStack.push(currentModalId);

    if (bodyLockCount === 0) {
      originalBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    bodyLockCount += 1;

    const focusDialog = window.requestAnimationFrame(() => {
      const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (firstFocusable ?? dialogRef.current)?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (modalStack[modalStack.length - 1] !== currentModalId) return;

      if (event.key === 'Escape' && !preventCloseRef.current) {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((element) => !element.hasAttribute('disabled'));

      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusDialog);
      document.removeEventListener('keydown', handleKeyDown);

      const stackIndex = modalStack.lastIndexOf(currentModalId);
      if (stackIndex >= 0) modalStack.splice(stackIndex, 1);

      bodyLockCount = Math.max(0, bodyLockCount - 1);
      if (bodyLockCount === 0) {
        document.body.style.overflow = originalBodyOverflow;
      }

      previousActiveElement.current?.focus();
    };
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  const hasZeroPadding = /(^|\s)p-0(\s|$)/.test(contentClassName);

  const handleBackdropMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !preventClose) onClose();
  };

  return createPortal(
    <div
      className="admin-modal-viewport fixed inset-0 z-[1000] flex h-dvh min-h-0 w-screen items-center justify-center overflow-hidden bg-black/55 p-[max(0.5rem,env(safe-area-inset-top))_max(0.5rem,env(safe-area-inset-right))_max(0.5rem,env(safe-area-inset-bottom))_max(0.5rem,env(safe-area-inset-left))] backdrop-blur-[8px] sm:p-4"
      role="presentation"
      onMouseDown={handleBackdropMouseDown}
    >
      <div className="admin-theme" style={{ display: 'contents' }}>
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          aria-busy={preventClose || undefined}
          tabIndex={-1}
          className={`admin-modal-panel relative flex max-h-[calc(100dvh-1rem)] min-h-0 w-full flex-col overflow-hidden rounded-xl border border-white/12 bg-[#1c1a18] text-[#f2f0eb] shadow-[0_28px_90px_rgba(0,0,0,0.58)] outline-none sm:max-h-[calc(100dvh-2rem)] sm:rounded-2xl ${contentClassName}`}
          style={{ overflow: 'hidden' }}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div
            className={`admin-modal-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain ${
              hasZeroPadding ? 'p-0' : 'p-4 sm:p-6'
            }`}
            tabIndex={-1}
          >
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
