import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';

interface ISectionHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export default function SectionHeader({
  title,
  description,
  action,
  className,
}: ISectionHeaderProps) {
  return (
    <div className={cn('mb-4 flex flex-wrap items-start justify-between gap-3', className)}>
      <div className="min-w-0">
        <h2 className="type-heading-lg text-(--text-primary)">{title}</h2>
        {description && (
          <p className="type-body-sm mt-1 max-w-2xl text-(--text-secondary)">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
