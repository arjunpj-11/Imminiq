import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'

interface EmptyStateProps {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex min-h-55 flex-col items-center justify-center rounded-[18px] border-[1.5px] border-dashed border-[#d8c7bc] bg-[rgba(253,248,245,0.68)] px-6 py-10 text-center dark:border-white/12 dark:bg-[rgba(30,28,25,0.7)]',
        className,
      )}
    >
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(184,76,43,0.09)] text-[#b84c2b] dark:bg-[rgba(232,129,106,0.12)] dark:text-[#e8816a]">
          {icon}
        </div>
      )}
      <h2 className="font-['Playfair_Display',serif] text-[20px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
        {title}
      </h2>
      {description && (
        <div className="mt-2 max-w-lg text-[13px] leading-[1.65] text-[#6b5f58] dark:text-[#9b9a92]">
          {description}
        </div>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
