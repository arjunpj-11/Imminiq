import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';

interface IPageHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: IPageHeaderProps) {
  return (
    <header
      className={cn(
        'relative flex flex-wrap items-end justify-between gap-x-6 gap-y-4 overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-5 shadow-(--shadow-1) sm:p-6 max-[640px]:items-start',
        className
      )}
    >
      <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(184,76,43,0.14)_0%,transparent_70%)]" />
      <div className="relative min-w-0 flex-1">
        {eyebrow && (
          <p className="inline-flex items-center gap-2 rounded-full border border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.08)] px-3 py-1.5 type-label-sm text-(--brand-500)">
            <span className="h-1.5 w-1.5 rounded-full bg-(--success)" />
            {eyebrow}
          </p>
        )}
        <h1 className={cn('type-heading-xl text-(--text-primary)', eyebrow && 'mt-3')}>{title}</h1>
        {description && (
          <div className="type-body-md mt-2 max-w-3xl text-(--text-secondary)">{description}</div>
        )}
      </div>
      {actions && (
        <div className="relative flex shrink-0 flex-wrap items-center gap-2 max-[640px]:w-full max-[640px]:*:flex-1">
          {actions}
        </div>
      )}
    </header>
  );
}
