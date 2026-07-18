import { CalendarDays } from "lucide-react";

import type { AdminDatePreset } from "../../hooks/useAdminDateRange";
import { useAdminDateRange } from "../../hooks/useAdminDateRange";

export function AdminDateRangeFilter({
  preset,
  range,
  setPreset,
  setFrom,
  setTo,
}: ReturnType<typeof useAdminDateRange>) {
  return (
    <fieldset className="admin-date-filter" aria-label="Report date range">
      <legend className="sr-only">Report date range</legend>
      <span className="admin-date-filter__icon" aria-hidden="true">
        <CalendarDays size={16} />
      </span>
      <label className="admin-date-filter__field">
        <span className="sr-only">Date range preset</span>
        <select
          value={preset}
          onChange={(event) =>
            setPreset(
              event.target.value === "custom"
                ? "custom"
                : (Number(event.target.value) as AdminDatePreset),
            )
          }
          className="admin-select"
        >
          <option value={4}>Last 4 days</option>
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value="custom">Custom range</option>
        </select>
      </label>
      <div className="admin-date-filter__custom" aria-label="Custom date range">
        <label className="admin-date-filter__field">
          <span className="admin-date-filter__label">From</span>
          <input
            type="date"
            value={range.from}
            max={range.to}
            onChange={(event) =>
              event.target.value && setFrom(event.target.value)
            }
            className="admin-select"
          />
        </label>
        <span className="admin-date-filter__separator" aria-hidden="true">
          –
        </span>
        <label className="admin-date-filter__field">
          <span className="admin-date-filter__label">To</span>
          <input
            type="date"
            value={range.to}
            min={range.from}
            onChange={(event) =>
              event.target.value && setTo(event.target.value)
            }
            className="admin-select"
          />
        </label>
      </div>
    </fieldset>
  );
}
