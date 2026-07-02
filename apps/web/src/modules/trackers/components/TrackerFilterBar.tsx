import PillTabs from '../../../components/navigation/PillTabs'
import { trackerFilterStatusOptions } from '../constants/tracker-filter.constants'
import type { TrackerStatusFilter } from '../types/tracker.types'

type TrackerFilterBarProps = {
  status: TrackerStatusFilter
  onStatusChange: (status: TrackerStatusFilter) => void
}

export default function TrackerFilterBar({
  status,
  onStatusChange,
}: TrackerFilterBarProps) {
  return (
    <section className="overflow-x-auto rounded-[20px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-3 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19]">
      <PillTabs
        value={status}
        onValueChange={onStatusChange}
        ariaLabel="Tracker status"
        className="min-w-max border-0 bg-transparent p-0 dark:bg-transparent"
        itemClassName="whitespace-nowrap font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.12em]"
        items={trackerFilterStatusOptions.map((item) => ({
          value: item.value,
          label: item.label,
        }))}
      />
    </section>
  )
}
