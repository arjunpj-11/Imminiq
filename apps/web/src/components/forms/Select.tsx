import { forwardRef, type SelectHTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          'w-full rounded-[11px] border-[1.5px] border-[#e0d0c5] bg-white px-3.5 py-3 text-[13px] font-medium text-[#1a1714] outline-none transition focus:border-[#b84c2b] focus:shadow-[0_0_0_3px_rgba(184,76,43,0.18)] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/9 dark:bg-[#252320] dark:text-[#f2f0eb] dark:focus:border-[#e8816a]',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    )
  },
)

export default Select
