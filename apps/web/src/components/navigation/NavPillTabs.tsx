import type { ReactNode } from 'react';
import { NavLink } from 'react-router';

import { cn } from '../../lib/cn';

export interface INavPillTabItem {
  to: string;
  label: ReactNode;
  icon?: ReactNode;
  end?: boolean;
}

interface INavPillTabsProps {
  items: readonly INavPillTabItem[];
  className?: string;
  itemClassName?: string;
  ariaLabel?: string;
}

export default function NavPillTabs({
  items,
  className,
  itemClassName,
  ariaLabel = 'Page sections',
}: INavPillTabsProps) {
  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        'flex max-w-full flex-wrap gap-1 rounded-2xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-2 dark:border-(--border-subtle) dark:bg-(--surface-card)',
        className
      )}
    >
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cn(
              'inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(184,76,43,0.22)]',
              isActive
                ? 'bg-(--brand-500) text-[#fdf8f5] dark:bg-(--brand-500) dark:text-[#141412]'
                : 'text-(--text-secondary) hover:bg-[rgba(184,76,43,0.07)] hover:text-(--brand-500) dark:text-(--text-secondary) dark:hover:bg-[rgba(232,129,106,0.08)] dark:hover:text-(--brand-500)',
              itemClassName
            )
          }
        >
          {item.icon}
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
