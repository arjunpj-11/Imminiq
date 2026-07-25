import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';

export type StatTone = 'rust' | 'green' | 'amber' | 'blue';
export interface IStatAccent {
  light: string;
  dark: string;
}

const toneColors: Record<StatTone, string> = {
  rust: 'var(--brand-500)',
  green: 'var(--success)',
  amber: 'var(--warning)',
  blue: 'var(--info)',
};

interface IStatCardProps {
  label: ReactNode;
  value?: ReactNode;
  helper?: ReactNode;
  footer?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  tone?: StatTone;
  accent?: IStatAccent;
  className?: string;
  valueClassName?: string;
  variant?: 'flat' | 'elevated' | 'spotlight';
  trend?: ReactNode;
}

export default function StatCard({
  label,
  value,
  helper,
  footer,
  action,
  children,
  tone = 'rust',
  accent,
  className,
  valueClassName,
  variant = 'flat',
  trend,
}: IStatCardProps) {
  const color = accent?.light ?? toneColors[tone];

  return (
    <div
      className={cn(
        'relative flex min-w-0 flex-col overflow-hidden p-3.5 sm:p-4.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
        variant === 'flat' && 'surface-flat',
        variant === 'elevated' && 'surface-elevated',
        variant === 'spotlight' && 'surface-spotlight',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="type-label-sm text-(--text-muted)">{label}</div>
        {trend && (
          <div className="font-mono text-[10px] font-semibold" style={{ color }}>
            {trend}
          </div>
        )}
      </div>

      {value !== undefined && (
        <div className={cn('type-metric-xl mt-2 sm:mt-3 text-(--text-primary)', valueClassName)}>
          {value}
        </div>
      )}

      {children}

      {helper && <div className="type-body-sm mt-2.5 flex-1 text-(--text-secondary)">{helper}</div>}

      {footer && <div className="mt-2.5">{footer}</div>}
      {action && <div className="mt-3">{action}</div>}

      <span
        aria-hidden="true"
        className="absolute bottom-0 left-4 right-4 h-px opacity-55"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />
    </div>
  );
}
