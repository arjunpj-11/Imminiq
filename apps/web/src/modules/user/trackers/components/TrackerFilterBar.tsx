import { Search, X } from 'lucide-react';

import PillTabs from '../../../../components/navigation/PillTabs';
import { trackerFilterStatusOptions } from '../constants/tracker-filter.constants';
import type { TrackerStatusFilter } from '../types/tracker.types';

type TrackerFilterBarProps = {
  status: TrackerStatusFilter;
  search: string;
  onStatusChange: (status: TrackerStatusFilter) => void;
  onSearchChange: (search: string) => void;
};

export default function TrackerFilterBar({
  status,
  search,
  onStatusChange,
  onSearchChange,
}: TrackerFilterBarProps) {
  return (
    <section className="flex flex-wrap items-center gap-4 rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) px-4 py-3 shadow-(--shadow-1)">
      <div className="shrink-0 max-[680px]:mb-2.5">
        <p className="text-[12px] font-extrabold text-(--text-primary)">Your learning paths</p>
        <p className="mt-0.5 text-[11px] text-(--text-secondary)">Search or filter by status</p>
      </div>
      <label className="flex h-10 min-w-[220px] flex-[1_1_260px] items-center gap-2 rounded-xl border border-(--border-subtle) bg-(--surface-canvas) px-3 focus-within:border-(--brand-500) focus-within:ring-2 focus-within:ring-[rgba(184,76,43,0.1)]">
        <Search size={15} className="shrink-0 text-(--text-muted)" aria-hidden="true" />
        <input
          type="search"
          value={search}
          maxLength={120}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search trackers"
          aria-label="Search trackers by title or description"
          className="min-w-0 flex-1 border-0 bg-transparent text-[12px] outline-none placeholder:text-(--text-muted)"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Clear tracker search"
            className="grid h-7 w-7 place-items-center rounded-full text-(--text-muted) hover:bg-(--surface-muted) hover:text-(--text-primary)"
          >
            <X size={13} />
          </button>
        )}
      </label>
      <div className="min-w-0 flex-[2_1_460px] overflow-x-auto">
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
