import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'

interface IStatGridProps {
  children: ReactNode
  className?: string
  columns?: 2 | 3 | 4
}

const columnClasses = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 xl:grid-cols-3',
  4: 'sm:grid-cols-2 xl:grid-cols-4',
} as const

export default function StatGrid({
  children,
  className,
  columns = 4,
}: IStatGridProps) {
  return (
    <section className={cn('grid grid-cols-1 gap-3', columnClasses[columns], className)}>
      {children}
    </section>
  )
}
