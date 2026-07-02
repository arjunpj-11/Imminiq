import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'

interface FormFieldProps {
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
  children: ReactNode
  className?: string
  labelClassName?: string
}

export default function FormField({
  label,
  hint,
  error,
  children,
  className,
  labelClassName,
}: FormFieldProps) {
  return (
    <label className={cn('block', className)}>
      {label && (
        <span
          className={cn(
            "mb-2 block font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.16em] text-[#6b5f58] opacity-70 dark:text-[#9b9a92]",
            labelClassName,
          )}
        >
          {label}
        </span>
      )}
      {children}
      {error ? (
        <span className="mt-1.5 block text-[11px] text-[#d94535] dark:text-[#ff6b5f]">
          {error}
        </span>
      ) : hint ? (
        <span className="mt-1.5 block text-[11px] text-[#9b9a92]">{hint}</span>
      ) : null}
    </label>
  )
}
