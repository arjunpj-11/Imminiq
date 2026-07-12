import { useId, type ReactNode } from 'react'

import { cn } from '../../lib/cn'

interface IFormFieldProps {
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
  children: ReactNode
  className?: string
  labelClassName?: string
  required?: boolean
}

export default function FormField({
  label,
  hint,
  error,
  children,
  className,
  labelClassName,
  required = false,
}: IFormFieldProps) {
  const messageId = useId()

  return (
    <label className={cn('block', className)}>
      {label && (
        <span
          className={cn(
            'mb-2 flex items-center gap-1 text-[12px] font-[650] text-(--text-primary)',
            labelClassName,
          )}
        >
          {label}
          {required && (
            <span className="text-(--danger)" aria-hidden="true">*</span>
          )}
        </span>
      )}
      {children}
      {error ? (
        <span id={messageId} role="alert" className="mt-1.5 block text-[11px] leading-4 text-(--danger)">
          {error}
        </span>
      ) : hint ? (
        <span id={messageId} className="mt-1.5 block text-[11px] leading-4 text-(--text-muted)">
          {hint}
        </span>
      ) : null}
    </label>
  )
}
