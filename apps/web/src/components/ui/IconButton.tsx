import { forwardRef, type ButtonHTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'surface' | 'ghost'
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      label,
      size = 'md',
      variant = 'surface',
      className,
      type = 'button',
      children,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        title={label}
        className={cn(
          'interactive-lift inline-flex shrink-0 items-center justify-center rounded-md text-(--text-secondary) focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
          variant === 'surface'
            ? 'border border-(--border-subtle) bg-(--surface-elevated) shadow-(--shadow-1) hover:border-[color-mix(in_srgb,var(--brand-500)_32%,var(--border-subtle))] hover:text-(--brand-500)'
            : 'border border-transparent bg-transparent hover:bg-(--surface-muted) hover:text-(--text-primary)',
          size === 'sm' && 'h-8 w-8',
          size === 'md' && 'h-10 w-10',
          size === 'lg' && 'h-12 w-12',
          className,
        )}
        {...props}
      >
        {children}
      </button>
    )
  },
)

export default IconButton
