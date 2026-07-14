import type { AdminDatePreset } from '../hooks/useAdminDateRange';
import { useAdminDateRange } from '../hooks/useAdminDateRange';

export function AdminDateRangeFilter({
  preset,
  range,
  setPreset,
  setFrom,
  setTo,
}: ReturnType<typeof useAdminDateRange>) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={preset}
        onChange={(event) =>
          setPreset(
            event.target.value === 'custom'
              ? 'custom'
              : (Number(event.target.value) as AdminDatePreset)
          )
        }
        className="admin-select"
        aria-label="Date range preset"
      >
        <option value={4}>Last 4 days</option>
        <option value={7}>Last 7 days</option>
        <option value={30}>Last 30 days</option>
        <option value={90}>Last 90 days</option>
        <option value="custom">Custom range</option>
      </select>
      <input
        type="date"
        value={range.from}
        max={range.to}
        onChange={(event) => event.target.value && setFrom(event.target.value)}
        className="admin-select"
        aria-label="Start date"
      />
      <span className="text-xs text-[#817c75]">to</span>
      <input
        type="date"
        value={range.to}
        min={range.from}
        onChange={(event) => event.target.value && setTo(event.target.value)}
        className="admin-select"
        aria-label="End date"
      />
    </div>
  );
}
