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
    'border-transparent bg-[#b84c2b] text-white hover:bg-[#963d22] dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]',
  secondary:
    'border-[#e0d0c5] bg-[#fdf8f5] text-[#6b5f58] hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.06)] hover:text-[#b84c2b] dark:border-white/10 dark:bg-[#1e1c19] dark:text-[#9b9a92] dark:hover:text-[#e8816a]',
  ghost:
    'border-transparent bg-transparent text-[#6b5f58] hover:bg-[rgba(184,76,43,0.07)] hover:text-[#b84c2b] dark:text-[#9b9a92] dark:hover:text-[#e8816a]',
  danger:
    'border-transparent bg-[#d94535] text-white hover:bg-[#b9362b] dark:bg-[#e05252] dark:hover:bg-[#c94545]',
  'outline-danger':
    'border-red-400/50 bg-transparent text-red-600 hover:bg-red-500/10 dark:border-red-400/40 dark:text-red-400',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-8 rounded-lg px-3 py-1.5 text-[11px]',
  md: 'min-h-10 rounded-[10px] px-4 py-2.5 text-[12px]',
  lg: 'min-h-11 rounded-xl px-5 py-3 text-[13px]',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  loadingText?: ReactNode
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
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
        'inline-flex items-center justify-center gap-2 border font-bold transition duration-150 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[rgba(184,76,43,0.22)] disabled:cursor-not-allowed disabled:opacity-55',
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
      {loading && loadingText !== undefined ? loadingText : children}
      {!loading && rightIcon}
    </button>
  )
})

export default Button
