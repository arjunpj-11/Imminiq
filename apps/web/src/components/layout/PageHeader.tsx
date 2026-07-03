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
        'flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b border-(--border-subtle) pb-5 max-[640px]:items-start max-[640px]:pb-4',
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <p className="type-label-sm text-(--brand-500)">{eyebrow}</p>
        )}
        <h1 className={cn('type-heading-xl text-(--text-primary)', eyebrow && 'mt-2')}>
          {title}
        </h1>
        {description && (
          <div className="type-body-md mt-2 max-w-3xl text-(--text-secondary)">
            {description}
          </div>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 max-[640px]:w-full max-[640px]:*:flex-1">
          {actions}
        </div>
      )}
    </header>
  )
}
