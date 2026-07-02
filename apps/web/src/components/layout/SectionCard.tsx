import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'

interface SectionCardProps {
  children: ReactNode
  className?: string
}

export default function SectionCard({ children, className }: SectionCardProps) {
  return (
    <section
      className={cn(
        'rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19]',
        className,
      )}
    >
      {children}
    </section>
  )
}
