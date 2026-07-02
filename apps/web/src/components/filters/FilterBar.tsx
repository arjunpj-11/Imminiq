import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'

interface FilterBarProps {
  children: ReactNode
  className?: string
  surface?: boolean
}

export default function FilterBar({
  children,
  className,
  surface = false,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-wrap items-center gap-3',
        surface &&
          'rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] p-3 dark:border-white/9 dark:bg-[#1e1c19]',
        className,
      )}
    >
      {children}
    </div>
  )
}
