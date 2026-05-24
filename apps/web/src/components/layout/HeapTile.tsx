import { useEffect, useMemo, useRef } from "react";
import type {
  HeatmapIntensity,
  StreakSummary,
} from "../../modules/users/types/profile.types";

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

interface HeapTileProps {
  streak?: StreakSummary;
  year: number;
  onYearChange: (year: number) => void;
  isLoading?: boolean;
  accountCreatedAt?: string | Date | null;
}

interface HeatmapCell {
  date: Date;
  inside: boolean;
  intensityLevel: HeatmapIntensity;
  activityCount: number;
  isFrozen: boolean;
}

const intensityClass: Record<HeatmapIntensity, string> = {
  none: "bg-[rgba(26,23,20,0.09)] dark:bg-[rgba(242,240,235,0.07)]",
  low: "bg-[rgba(184,76,43,0.18)] dark:bg-[rgba(232,129,106,0.22)]",
  medium:
    "bg-[rgba(184,76,43,0.38)] dark:bg-[rgba(232,129,106,0.42)]",
  high: "bg-[#b84c2b] dark:bg-[#e8816a]",
};

const toDateKey = (value: Date) => value.toISOString().slice(0, 10);

function resolveAccountStartYear(accountCreatedAt?: string | Date | null) {
  const currentYear = new Date().getFullYear();

  if (!accountCreatedAt) {
    return currentYear;
  }

  const accountDate = new Date(accountCreatedAt);

  if (Number.isNaN(accountDate.getTime())) {
    return currentYear;
  }

  const createdYear = accountDate.getFullYear();

  return Math.min(Math.max(createdYear, 2000), currentYear);
}

function buildHeatmap(year: number, streak?: StreakSummary) {
  const first = new Date(Date.UTC(year, 0, 1));
  const last = new Date(Date.UTC(year, 11, 31));

  const start = new Date(first);
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());

  const end = new Date(last);
  end.setUTCDate(end.getUTCDate() + (6 - end.getUTCDay()));

  const heatmapByDate = new Map(
    (streak?.heatmap ?? []).map((item) => [item.date, item]),
  );

  const weeks: HeatmapCell[][] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    const week: HeatmapCell[] = [];

    for (let day = 0; day < 7; day += 1) {
      const date = new Date(cursor);
      const inside = date.getUTCFullYear() === year;
      const match = heatmapByDate.get(toDateKey(date));

      week.push({
        date,
        inside,
        intensityLevel: match?.intensityLevel ?? "none",
        activityCount: match?.activityCount ?? 0,
        isFrozen: Boolean(match?.isFrozen),
      });

      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    weeks.push(week);
  }

  const months = Array.from({ length: 12 }, (_, monthIndex) => {
    const monthStart = new Date(Date.UTC(year, monthIndex, 1));
    const daysFromStart = Math.round(
      (monthStart.getTime() - start.getTime()) / 86400000,
    );

    return {
      label: monthStart.toLocaleDateString(undefined, {
        month: "short",
        timeZone: "UTC",
      }),
      weekIndex: Math.floor(daysFromStart / 7),
    };
  });

  return { weeks, months };
}

export default function HeapTile({
  streak,
  year,
  onYearChange,
  isLoading = false,
  accountCreatedAt,
}: HeapTileProps) {
  const currentYear = new Date().getFullYear();
  const accountStartYear = resolveAccountStartYear(accountCreatedAt);
  const scrollRef = useRef<HTMLDivElement>(null);

  const years = useMemo(
    () =>
      Array.from(
        { length: currentYear - accountStartYear + 1 },
        (_, index) => currentYear - index,
      ),
    [accountStartYear, currentYear],
  );

  useEffect(() => {
    if (!years.includes(year)) {
      onYearChange(years[0] ?? currentYear);
    }
  }, [currentYear, onYearChange, year, years]);

  useEffect(() => {
    if (scrollRef.current && year === currentYear) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [currentYear, year]);

  const { weeks, months } = useMemo(
    () => buildHeatmap(year, streak),
    [streak, year],
  );

  return (
    <section className="rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-[22px] shadow-[0_2px_16px_rgba(26,23,20,0.06),0_1px_3px_rgba(26,23,20,0.04)] dark:border-white/[0.09] dark:bg-[#1e1c19] dark:shadow-[0_4px_24px_rgba(0,0,0,0.28),0_1px_4px_rgba(0,0,0,0.18)] max-[640px]:p-[18px]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3.5">
        <div className="flex items-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-[#b84c2b] dark:text-[#e8816a]"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <h2 className="font-['Playfair_Display',serif] text-[18px] font-extrabold tracking-[-0.3px] text-[#1a1714] dark:text-[#f2f0eb]">
            Learning Streak
          </h2>
        </div>

        <div className="flex flex-wrap items-start justify-end gap-4 max-[640px]:w-full max-[640px]:justify-between">
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col items-end gap-px max-[640px]:items-start">
              <span className="font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-[0.12em] text-[#6b5f58] opacity-50 dark:text-[#9b9a92]">
                Current
              </span>
              <span className="font-['Playfair_Display',serif] text-[16px] font-extrabold leading-none text-[#b84c2b] dark:text-[#e8816a]">
                🔥 {streak?.currentStreak ?? 0} days
              </span>
            </div>
            <div className="flex flex-col items-end gap-px max-[640px]:items-start">
              <span className="font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-[0.12em] text-[#6b5f58] opacity-50 dark:text-[#9b9a92]">
                Personal Best
              </span>
              <span className="font-['Playfair_Display',serif] text-[16px] font-extrabold leading-none text-[#c98000] dark:text-[#f0a842]">
                ⭐ {streak?.longestStreak ?? 0} days
              </span>
            </div>
          </div>

          <div className="flex min-w-[108px] flex-col gap-[5px]">
            <label className="text-right font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-[0.14em] text-[#6b5f58] opacity-55 dark:text-[#9b9a92] max-[640px]:text-left">
              Year
            </label>
            <select
              value={year}
              onChange={(event) => onYearChange(Number(event.target.value))}
              aria-label="Select learning activity year"
              className="min-w-[108px] appearance-none rounded-[9px] border-[1.5px] border-[#e0d0c5] bg-white px-[11px] py-2 pr-8 font-['DM_Sans',sans-serif] text-[12.5px] font-semibold text-[#1a1714] outline-none transition focus:border-[#b84c2b] focus:shadow-[0_0_0_3px_rgba(184,76,43,0.18)] dark:border-white/[0.09] dark:bg-[#252320] dark:text-[#f2f0eb] dark:focus:border-[#e8816a]"
            >
              {years.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="overflow-x-auto pb-1.5 [scrollbar-width:thin] [scrollbar-color:rgba(184,76,43,0.28)_transparent] dark:[scrollbar-color:rgba(232,129,106,0.34)_transparent] [&::-webkit-scrollbar]:h-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[rgba(184,76,43,0.28)] dark:[&::-webkit-scrollbar-thumb]:bg-[rgba(232,129,106,0.34)]"
      >
        <div
          className="grid min-w-max items-start gap-x-2 gap-y-[7px]"
          style={{
            gridTemplateColumns: "34px auto",
            gridTemplateRows: "18px auto",
          }}
          role="img"
          aria-label={`Learning activity calendar heatmap for ${year}`}
        >
          <div
            style={{ gridColumn: 2, gridRow: 1 }}
            className="relative h-[18px] min-w-fit"
          >
            {months.map((month) => (
              <span
                key={`${month.label}-${month.weekIndex}`}
                className="absolute top-0 -translate-x-px whitespace-nowrap font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.08em] text-[#6b5f58] opacity-65 dark:text-[#9b9a92]"
                style={{ left: month.weekIndex * 14 }}
              >
                {month.label}
              </span>
            ))}
          </div>

          <div
            style={{ gridColumn: 1, gridRow: 2 }}
            className="grid grid-rows-7 gap-[3px]"
            aria-hidden="true"
          >
            {["", "Mon", "", "Wed", "", "Fri", ""].map((weekday, index) => (
              <span
                key={`${weekday}-${index}`}
                className="h-[11px] font-['DM_Mono',monospace] text-[7px] uppercase leading-[11px] tracking-[0.08em] text-[#6b5f58] opacity-60 dark:text-[#9b9a92]"
              >
                {weekday}
              </span>
            ))}
          </div>

          <div
            style={{ gridColumn: 2, gridRow: 2 }}
            className="flex min-w-fit gap-[3px]"
          >
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[3px]">
                {week.map((cell, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={cn(
                      "h-[11px] w-[11px] shrink-0 cursor-default rounded-[2px] transition-all duration-150 hover:scale-[1.12] hover:opacity-85",
                      cell.inside
                        ? intensityClass[cell.intensityLevel]
                        : "pointer-events-none opacity-0",
                    )}
                    title={
                      cell.inside
                        ? `${cell.date.toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            timeZone: "UTC",
                          })} · ${cell.activityCount} activit${
                            cell.activityCount === 1 ? "y" : "ies"
                          }${cell.isFrozen ? " · Streak freeze used" : ""}`
                        : ""
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center justify-end gap-1.5">
        <span className="font-['DM_Mono',monospace] text-[8px] text-[#6b5f58] opacity-50 dark:text-[#9b9a92]">
          Less active
        </span>
        {(["none", "low", "medium", "high"] as HeatmapIntensity[]).map(
          (level) => (
            <div
              key={level}
              className={cn("h-[11px] w-[11px] rounded-[2px]", intensityClass[level])}
            />
          ),
        )}
        <span className="font-['DM_Mono',monospace] text-[8px] text-[#6b5f58] opacity-50 dark:text-[#9b9a92]">
          More active
        </span>
      </div>

      {isLoading && (
        <div className="mt-3 text-[12px] font-medium text-[#6b5f58] dark:text-[#9b9a92]">
          Loading learning activity…
        </div>
      )}
    </section>
  );
}
