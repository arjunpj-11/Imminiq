import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

import { cn } from '../../lib/cn'

export interface NavPillTabItem {
  to: string
  label: ReactNode
  icon?: ReactNode
  end?: boolean
}

interface NavPillTabsProps {
  items: readonly NavPillTabItem[]
  className?: string
  itemClassName?: string
  ariaLabel?: string
}

export default function NavPillTabs({
  items,
  className,
  itemClassName,
  ariaLabel = 'Page sections',
}: NavPillTabsProps) {
  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        'flex max-w-full flex-wrap gap-1 rounded-2xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-2 dark:border-white/9 dark:bg-[#1e1c19]',
        className,
      )}
    >
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cn(
              'inline-flex items-center gap-2 rounded-[11px] px-4 py-2.5 text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(184,76,43,0.22)]',
              isActive
                ? 'bg-[#b84c2b] text-[#fdf8f5] dark:bg-[#e8816a] dark:text-[#141412]'
                : 'text-[#6b5f58] hover:bg-[rgba(184,76,43,0.07)] hover:text-[#b84c2b] dark:text-[#9b9a92] dark:hover:bg-[rgba(232,129,106,0.08)] dark:hover:text-[#e8816a]',
              itemClassName,
            )
          }
        >
          {item.icon}
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
