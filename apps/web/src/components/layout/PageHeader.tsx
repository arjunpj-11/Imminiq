import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'

interface PageHeaderProps {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  className?: string
}

export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-wrap items-start justify-between gap-4',
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.18em] text-[#b84c2b] dark:text-[#e8816a]">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 font-['Playfair_Display',serif] text-[clamp(30px,5vw,42px)] font-extrabold tracking-[-0.9px] text-[#1a1714] dark:text-[#f2f0eb]">
          {title}
        </h1>
        {description && (
          <div className="mt-2 max-w-3xl text-[14px] leading-[1.7] text-[#6b5f58] dark:text-[#9b9a92]">
            {description}
          </div>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  )
}
