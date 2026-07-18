import PillTabs from "../../../../components/navigation/PillTabs";
import { trackerFilterStatusOptions } from "../constants/tracker-filter.constants";
import type { TrackerStatusFilter } from "../types/tracker.types";

type TrackerFilterBarProps = {
  status: TrackerStatusFilter;
  onStatusChange: (status: TrackerStatusFilter) => void;
};

export default function TrackerFilterBar({
  status,
  onStatusChange,
}: TrackerFilterBarProps) {
  return (
    <section className="flex items-center gap-4 rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) px-4 py-3 shadow-(--shadow-1) max-[680px]:block">
      <div className="shrink-0 max-[680px]:mb-2.5">
        <p className="text-[12px] font-extrabold text-(--text-primary)">
          Your learning paths
        </p>
        <p className="mt-0.5 text-[11px] text-(--text-secondary)">
          Filter by current status
        </p>
      </div>
      <div className="min-w-0 flex-1 overflow-x-auto">
        <PillTabs
          value={status}
          onValueChange={onStatusChange}
          ariaLabel="Filter trackers by status"
          className="min-w-max border-0 bg-transparent p-0 dark:bg-transparent"
          itemClassName="whitespace-nowrap px-3.5 py-2 text-[11px] font-bold"
          items={trackerFilterStatusOptions.map((item) => ({
            value: item.value,
            label: item.label,
          }))}
        />
      </div>
    </section>
  );
}
