import type { TrackerStatusFilter } from '../types/tracker.types'

import { trackerFilterStatusOptions } from '../constants/tracker-filter.constants'
import { cn } from '../utils/tracker-ui'

type TrackerFilterBarProps = {
  status: TrackerStatusFilter
  onStatusChange: (status: TrackerStatusFilter) => void
}

export default function TrackerFilterBar({
  status,
  onStatusChange,
}: TrackerFilterBarProps) {
  return (
    <section className="flex items-center justify-between rounded-[20px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-3 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19] max-[640px]:overflow-x-auto">
      <div className="flex min-w-max items-center gap-1.5">
        {trackerFilterStatusOptions.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onStatusChange(item.value)}
            className={cn(
              'whitespace-nowrap rounded-[10px] px-4 py-2.5 font-["DM_Mono",monospace] text-[8.5px] uppercase tracking-[0.12em] transition',
              status === item.value
                ? 'bg-[#b84c2b] text-[#fdf8f5] shadow-[0_6px_18px_rgba(184,76,43,0.22)] dark:bg-[#e8816a] dark:text-[#141412]'
                : 'text-[#6b5f58] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] dark:text-[#9b9a92] dark:hover:bg-[rgba(232,129,106,0.10)] dark:hover:text-[#e8816a]'
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </section>
  )
}
