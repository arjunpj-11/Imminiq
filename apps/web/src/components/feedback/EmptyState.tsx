import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';
import EmptyStateIllustration from './EmptyStateIllustration';

interface IEmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  role?: 'status' | 'alert';
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  role = 'status',
}: IEmptyStateProps) {
  return (
    <div
      role={role}
      aria-live={role === 'alert' ? 'assertive' : 'polite'}
      className={cn(
        'flex min-h-55 flex-col items-center justify-center rounded-lg border border-dashed border-(--border-strong) bg-[color-mix(in_srgb,var(--surface-card)_72%,transparent)] px-6 py-10 text-center',
        className
      )}
    >
      <div
        className={cn(
          'mb-4 flex items-center justify-center text-(--brand-500)',
          Boolean(icon) &&
            'h-12 w-12 rounded-md bg-[color-mix(in_srgb,var(--brand-500)_10%,transparent)]'
        )}
      >
        {icon ?? <EmptyStateIllustration />}
      </div>
      <h2 className="type-heading-lg text-(--text-primary)">{title}</h2>
      {description && (
        <div className="type-body-sm mt-2 max-w-lg text-(--text-secondary)">{description}</div>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
