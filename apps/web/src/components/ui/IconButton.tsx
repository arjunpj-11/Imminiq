import { forwardRef, type ButtonHTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  size?: 'sm' | 'md' | 'lg'
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { label, size = 'md', className, type = 'button', children, ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        title={label}
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-full border border-[#e0d0c5] bg-[#fdf8f5] text-[#6b5f58] transition hover:border-[#e8816a] hover:text-[#b84c2b] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[rgba(184,76,43,0.2)] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-[#1e1c19] dark:text-[#9b9a92] dark:hover:text-[#e8816a]',
          size === 'sm' && 'h-8 w-8',
          size === 'md' && 'h-10 w-10',
          size === 'lg' && 'h-11 w-11',
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
