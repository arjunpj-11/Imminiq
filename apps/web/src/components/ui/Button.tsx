import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

import { cn } from '../../lib/cn'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'outline-danger'

export type ButtonSize = 'sm' | 'md' | 'lg'

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border-transparent bg-[var(--brand-500)] text-[var(--brand-contrast)] shadow-[0_5px_16px_color-mix(in_srgb,var(--brand-500)_18%,transparent)] hover:bg-[var(--brand-600)] hover:shadow-[0_8px_22px_color-mix(in_srgb,var(--brand-500)_24%,transparent)]',
  secondary:
    'border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-primary)] shadow-[var(--shadow-1)] hover:border-[color-mix(in_srgb,var(--brand-500)_30%,var(--border-subtle))] hover:bg-[var(--surface-card)] hover:text-[var(--brand-500)]',
  ghost:
    'border-transparent bg-transparent text-[var(--text-secondary)] hover:bg-[color-mix(in_srgb,var(--brand-500)_8%,transparent)] hover:text-[var(--brand-500)]',
  danger:
    'border-transparent bg-[var(--danger)] text-white shadow-[0_5px_16px_color-mix(in_srgb,var(--danger)_18%,transparent)] hover:brightness-90',
  'outline-danger':
    'border-[color-mix(in_srgb,var(--danger)_40%,transparent)] bg-transparent text-[var(--danger)] hover:bg-[color-mix(in_srgb,var(--danger)_9%,transparent)]',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-8 rounded-[var(--radius-sm)] px-3 py-1.5 text-[11px]',
  md: 'min-h-10 rounded-[var(--radius-md)] px-4 py-2.5 text-[12px]',
  lg: 'min-h-12 rounded-[var(--radius-md)] px-5 py-3 text-[13px]',
}

export interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  loadingText?: ReactNode
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, IButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    loadingText,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    className,
    children,
    type = 'button',
    ...props
  },
  ref,
) {
  const isDisabled = disabled || loading

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        'font-ui interactive-lift inline-flex items-center justify-center gap-2 border font-[680] tracking-[-0.005em] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-55',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? (
        <span
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden="true"
        />
      ) : (
        leftIcon
      )}
      <span>{loading && loadingText !== undefined ? loadingText : children}</span>
      {!loading && rightIcon}
    </button>
  )
})

export default Button
