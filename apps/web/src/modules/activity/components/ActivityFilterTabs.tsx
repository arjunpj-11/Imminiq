import { ACTIVITY_FILTER_OPTIONS } from '../constants/activity.constants'
import type { ActivityFeedFilter } from '../types/activity.types'
import { cn } from '../utils/activity-ui'
import {
  ActivityIcon,
  ClipboardCheckIcon,
  GraduationCapIcon,
  UsersIcon,
} from './icons/ActivityIcons'

interface ActivityFilterTabsProps {
  activeFilter: ActivityFeedFilter
  disabled?: boolean
  onChange: (filter: ActivityFeedFilter) => void
}

const filterIcon = (filter: ActivityFeedFilter) => {
  switch (filter) {
    case 'trackers':
      return <GraduationCapIcon size={12} />
    case 'mock_tests':
      return <ClipboardCheckIcon size={12} />
    case 'community':
      return <UsersIcon size={12} />
    default:
      return <ActivityIcon size={12} />
  }
}

export default function ActivityFilterTabs({
  activeFilter,
  disabled = false,
  onChange,
}: ActivityFilterTabsProps) {
  return (
    <div
      className="flex w-fit flex-wrap gap-0.5 rounded-xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-0.75 dark:border-white/9 dark:bg-[#1e1c19]"
      role="group"
      aria-label="Activity filter"
    >
      {ACTIVITY_FILTER_OPTIONS.map((option) => {
        const isActive = activeFilter === option.value

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            disabled={disabled}
            aria-pressed={isActive}
            className={cn(
              "flex cursor-pointer select-none items-center gap-1.5 rounded-[9px] border-none px-3.5 py-1.5 font-['DM_Mono',monospace] text-[11px] font-bold uppercase tracking-[0.06em] transition-all disabled:cursor-not-allowed disabled:opacity-60",
              isActive
                ? 'bg-[#b84c2b] text-white dark:bg-[#e8816a] dark:text-[#141412]'
                : 'bg-transparent text-[#8a7d75] hover:text-[#b84c2b] dark:text-[#6b6460] dark:hover:text-[#e8816a]',
            )}
          >
            {filterIcon(option.value)}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
