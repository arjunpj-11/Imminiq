import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'

export interface PillTabItem<T extends string> {
  value: T
  label: ReactNode
  icon?: ReactNode
  count?: number
  disabled?: boolean
}

interface PillTabsProps<T extends string> {
  value: T
  items: Array<PillTabItem<T>>
  onValueChange: (value: T) => void
  className?: string
  itemClassName?: string
  ariaLabel?: string
}

export default function PillTabs<T extends string>({
  value,
  items,
  onValueChange,
  className,
  itemClassName,
  ariaLabel = 'Tabs',
}: PillTabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-[#e0d0c5] bg-[#fdf8f5] p-1 dark:border-white/9 dark:bg-[#1e1c19]',
        className,
      )}
    >
      {items.map((item) => {
        const active = item.value === value

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
                ? 'bg-[#b84c2b] text-white shadow-sm dark:bg-[#e8816a] dark:text-[#141412]'
                : 'text-[#6b5f58] hover:bg-[rgba(184,76,43,0.07)] hover:text-[#b84c2b] dark:text-[#9b9a92] dark:hover:text-[#e8816a]',
              itemClassName,
            )}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.count !== undefined && (
              <span
                className={cn(
                  'inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 font-["DM_Mono",monospace] text-[9px]',
                  active
                    ? 'bg-white/20 text-current'
                    : 'bg-black/5 text-[#6b5f58] dark:bg-white/8 dark:text-[#9b9a92]',
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
