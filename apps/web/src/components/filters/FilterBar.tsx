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
          'rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-3 dark:border-(--border-subtle) dark:bg-(--surface-card)',
        className,
      )}
    >
      {children}
    </div>
  )
}
