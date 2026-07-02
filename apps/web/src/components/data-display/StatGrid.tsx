import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'

interface StatGridProps {
  children: ReactNode
  className?: string
}

export default function StatGrid({ children, className }: StatGridProps) {
  return (
    <section
      className={cn(
        'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4',
        className,
      )}
    >
      {children}
    </section>
  )
}
