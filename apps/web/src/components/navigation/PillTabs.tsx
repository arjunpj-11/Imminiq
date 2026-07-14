import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';

export interface IPillTabItem<T extends string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  count?: number;
  disabled?: boolean;
}

interface IPillTabsProps<T extends string> {
  value: T;
  items: Array<IPillTabItem<T>>;
  onValueChange: (value: T) => void;
  className?: string;
  itemClassName?: string;
  ariaLabel?: string;
}

export default function PillTabs<T extends string>({
  value,
  items,
  onValueChange,
  className,
  itemClassName,
  ariaLabel = 'Tabs',
}: IPillTabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-(--border-subtle) bg-(--surface-card) p-1 dark:border-(--border-subtle) dark:bg-(--surface-card)',
        className
      )}
    >
      {items.map((item) => {
        const active = item.value === value;

        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={item.disabled}
            onClick={() => onValueChange(item.value)}
            className={cn(
              'inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-[12px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(184,76,43,0.22)] disabled:cursor-not-allowed disabled:opacity-50',
              active
                ? 'bg-(--brand-500) text-white shadow-sm dark:bg-(--brand-500) dark:text-[#141412]'
                : 'text-(--text-secondary) hover:bg-[rgba(184,76,43,0.07)] hover:text-(--brand-500) dark:text-(--text-secondary) dark:hover:text-(--brand-500)',
              itemClassName
            )}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.count !== undefined && (
              <span
                className={cn(
                  'inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 font-mono text-[9px]',
                  active
                    ? 'bg-white/20 text-current'
                    : 'bg-black/5 text-(--text-secondary) dark:bg-white/8 dark:text-(--text-secondary)'
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
