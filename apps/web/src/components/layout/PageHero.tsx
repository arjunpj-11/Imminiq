import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';

interface IPageHeroProps {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
  className?: string;
  compact?: boolean;
}

export default function PageHero({
  eyebrow,
  title,
  description,
  actions,
  aside,
  className,
  compact = false,
}: IPageHeroProps) {
  return (
    <header
      className={cn(
        'relative overflow-hidden rounded-3xl border border-(--border-subtle) bg-(--surface-card) shadow-(--shadow-1) backdrop-blur-md',
        compact ? 'p-5 sm:p-6' : 'p-5 sm:p-7 lg:p-8',
        className
      )}
    >
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(184,76,43,0.18)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(232,129,106,0.18)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute -bottom-24 left-[18%] h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(59,108,183,0.12)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(106,169,255,0.12)_0%,transparent_70%)]" />

      <div
        className={cn(
          'relative grid items-center gap-6',
          Boolean(aside) && 'lg:grid-cols-[minmax(0,1.35fr)_minmax(15rem,0.65fr)]'
        )}
      >
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.08)] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-(--brand-500) dark:border-[rgba(232,129,106,0.24)] dark:bg-[rgba(232,129,106,0.10)]">
            <span className="h-1.5 w-1.5 rounded-full bg-(--success) shadow-[0_0_10px_var(--success)]" />
            {eyebrow}
          </div>
          <h1
            className={cn(
              'mt-3 max-w-3xl font-ui font-extrabold leading-[1.08] tracking-[-1px] text-(--text-primary)',
              compact ? 'text-[clamp(27px,3.4vw,38px)]' : 'text-[clamp(30px,4vw,46px)]'
            )}
          >
            {title}
          </h1>
          <div className="mt-3 max-w-2xl text-[14px] leading-6 text-(--text-secondary)">
            {description}
          </div>
          {actions && <div className="mt-5 flex flex-wrap gap-3">{actions}</div>}
        </div>

        {aside && (
          <aside className="rounded-2xl border border-[rgba(184,76,43,0.16)] bg-[color-mix(in_srgb,var(--surface-elevated)_88%,var(--brand-500)_3%)] p-4.5 shadow-(--shadow-1)">
            {aside}
          </aside>
        )}
      </div>
    </header>
  );
}
