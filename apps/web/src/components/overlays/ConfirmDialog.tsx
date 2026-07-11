import { useId, type ReactNode } from 'react'

import { cn } from '../../lib/cn'
import Button from '../ui/Button'
import Modal from './Modal'

export type ConfirmDialogVariant = 'default' | 'danger'

interface IConfirmDialogProps {
  open: boolean
  title: ReactNode
  description?: ReactNode
  confirmText?: ReactNode
  cancelText?: ReactNode
  isLoading?: boolean
  variant?: ConfirmDialogVariant
  icon?: ReactNode
  header?: ReactNode
  onConfirm: () => void
  onClose: () => void
  contentClassName?: string
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  variant = 'default',
  icon,
  header,
  onConfirm,
  onClose,
  contentClassName,
}: IConfirmDialogProps) {
  const id = useId()
  const titleId = `confirm-title-${id}`
  const descriptionId = description ? `confirm-description-${id}` : undefined
  const isDanger = variant === 'danger'

  return (
    <Modal
      open={open}
      onClose={onClose}
      role="alertdialog"
      titleId={titleId}
      descriptionId={descriptionId}
      preventClose={isLoading}
      contentClassName={contentClassName}
    >
      {header ?? (
        <div className="mb-4 flex items-start gap-3">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-[18px]',
              isDanger
                ? 'border-red-400/40 bg-red-500/10 text-red-500 dark:border-red-400/30 dark:text-red-400'
                : 'border-(--border-subtle) bg-white/70 text-(--brand-500) dark:border-(--border-subtle) dark:bg-white/5 dark:text-(--brand-500)',
            )}
          >
            {icon ?? (isDanger ? '!' : '?')}
          </div>
          <div className="min-w-0">
            <h2
              id={titleId}
              className="text-[16px] font-bold leading-tight text-(--text-primary) dark:text-(--text-primary)"
            >
              {title}
            </h2>
            {description && (
              <div
                id={descriptionId}
                className="mt-1.5 text-[13px] leading-relaxed text-(--text-secondary) dark:text-(--text-secondary)"
              >
                {description}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={isLoading}
        >
          {cancelText}
        </Button>
        <Button
          variant={isDanger ? 'danger' : 'primary'}
          onClick={onConfirm}
          loading={isLoading}
          loadingText="Please wait..."
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  )
}
