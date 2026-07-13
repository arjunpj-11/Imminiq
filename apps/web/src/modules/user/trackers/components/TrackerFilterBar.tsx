import PillTabs from '../../../../components/navigation/PillTabs'
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
    <section className="overflow-x-auto rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-3 shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)">
      <PillTabs
        value={status}
        onValueChange={onStatusChange}
        ariaLabel="Tracker status"
        className="min-w-max border-0 bg-transparent p-0 dark:bg-transparent"
        itemClassName="whitespace-nowrap font-mono text-[8.5px] uppercase tracking-[0.12em]"
        items={trackerFilterStatusOptions.map((item) => ({
          value: item.value,
          label: item.label,
        }))}
      />
    </section>
  )
}
