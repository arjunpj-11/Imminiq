import { cn } from '../../lib/cn';

import { useEffect, useMemo, useRef } from 'react';
import type { HeatmapIntensity, IStreakSummary } from '../../modules/user/users';

interface IHeapTileProps {
  streak?: IStreakSummary;
  year: number;
  onYearChange: (year: number) => void;
  isLoading?: boolean;
  accountCreatedAt?: string | Date | null;
}

interface IHeatmapCell {
  date: Date;
  inside: boolean;
  intensityLevel: HeatmapIntensity;
  activityCount: number;
  isFrozen: boolean;
}

const intensityClass: Record<HeatmapIntensity, string> = {
  none: 'bg-[rgba(26,23,20,0.09)] dark:bg-[rgba(242,240,235,0.07)]',
  low: 'bg-[rgba(184,76,43,0.18)] dark:bg-[rgba(232,129,106,0.22)]',
  medium: 'bg-[rgba(184,76,43,0.38)] dark:bg-[rgba(232,129,106,0.42)]',
  high: 'bg-[var(--brand-500)] dark:bg-[var(--brand-500)]',
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

function buildHeatmap(year: number, streak?: IStreakSummary) {
  const first = new Date(Date.UTC(year, 0, 1));
  const last = new Date(Date.UTC(year, 11, 31));

  const start = new Date(first);
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());

  const end = new Date(last);
  end.setUTCDate(end.getUTCDate() + (6 - end.getUTCDay()));

  const heatmapByDate = new Map((streak?.heatmap ?? []).map((item) => [item.date, item]));

  const weeks: IHeatmapCell[][] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    const week: IHeatmapCell[] = [];

    for (let day = 0; day < 7; day += 1) {
      const date = new Date(cursor);
      const inside = date.getUTCFullYear() === year;
      const match = heatmapByDate.get(toDateKey(date));

      week.push({
        date,
        inside,
        intensityLevel: match?.intensityLevel ?? 'none',
        activityCount: match?.activityCount ?? 0,
        isFrozen: Boolean(match?.isFrozen),
      });

      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    weeks.push(week);
  }

  const months = Array.from({ length: 12 }, (_, monthIndex) => {
    const monthStart = new Date(Date.UTC(year, monthIndex, 1));
    const daysFromStart = Math.round((monthStart.getTime() - start.getTime()) / 86400000);

    return {
      label: monthStart.toLocaleDateString(undefined, {
        month: 'short',
        timeZone: 'UTC',
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
}: IHeapTileProps) {
  const currentYear = new Date().getFullYear();
  const accountStartYear = resolveAccountStartYear(accountCreatedAt);
  const scrollRef = useRef<HTMLDivElement>(null);

  const years = useMemo(
    () =>
      Array.from({ length: currentYear - accountStartYear + 1 }, (_, index) => currentYear - index),
    [accountStartYear, currentYear]
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

  const { weeks, months } = useMemo(() => buildHeatmap(year, streak), [streak, year]);

  return (
    <section className="rounded-lg border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-5.5 shadow-[0_2px_16px_rgba(26,23,20,0.06),0_1px_3px_rgba(26,23,20,0.04)] dark:border-(--border-subtle) dark:bg-(--surface-card) dark:shadow-[0_4px_24px_rgba(0,0,0,0.28),0_1px_4px_rgba(0,0,0,0.18)] max-[640px]:p-4.5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3.5">
        <div className="flex items-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-(--brand-500) dark:text-(--brand-500)"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <h2 className="font-ui text-[18px] font-extrabold tracking-[-0.3px] text-(--text-primary) dark:text-(--text-primary)">
            Learning Streak
          </h2>
        </div>

        <div className="flex flex-wrap items-start justify-end gap-4 max-[640px]:w-full max-[640px]:justify-between">
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col items-end gap-px max-[640px]:items-start">
              <span className="font-mono text-[7.5px] uppercase tracking-[0.12em] text-(--text-secondary) opacity-50 dark:text-(--text-secondary)">
                Current
              </span>
              <span className="font-ui text-[16px] font-extrabold leading-none text-(--brand-500) dark:text-(--brand-500)">
                🔥 {streak?.currentStreak ?? 0} days
              </span>
            </div>
            <div className="flex flex-col items-end gap-px max-[640px]:items-start">
              <span className="font-mono text-[7.5px] uppercase tracking-[0.12em] text-(--text-secondary) opacity-50 dark:text-(--text-secondary)">
                Personal Best
              </span>
              <span className="font-ui text-[16px] font-extrabold leading-none text-(--warning) dark:text-(--warning)">
                ⭐ {streak?.longestStreak ?? 0} days
              </span>
            </div>
          </div>

          <div className="flex min-w-27 flex-col gap-1.25">
            <label className="text-right font-mono text-[7.5px] uppercase tracking-[0.14em] text-(--text-secondary) opacity-55 dark:text-(--text-secondary) max-[640px]:text-left">
              Year
            </label>
            <select
              value={year}
              onChange={(event) => onYearChange(Number(event.target.value))}
              aria-label="Select learning activity year"
              className="min-w-27 appearance-none rounded-sm border-[1.5px] border-(--border-subtle) bg-white px-2.75 py-2 pr-8 font-ui text-[12.5px] font-semibold text-(--text-primary) outline-none transition focus:border-(--brand-500) focus:shadow-[0_0_0_3px_rgba(184,76,43,0.18)] dark:border-(--border-subtle) dark:bg-(--surface-elevated) dark:text-(--text-primary) dark:focus:border-(--brand-500)"
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
        className="overflow-x-auto pb-1.5 scrollbar-thin [scrollbar-color:rgba(184,76,43,0.28)_transparent] dark:[scrollbar-color:rgba(232,129,106,0.34)_transparent] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[rgba(184,76,43,0.28)] dark:[&::-webkit-scrollbar-thumb]:bg-[rgba(232,129,106,0.34)]"
      >
        <div
          className="grid min-w-max items-start gap-x-2 gap-y-1.75"
          style={{
            gridTemplateColumns: '34px auto',
            gridTemplateRows: '18px auto',
          }}
          role="img"
          aria-label={`Learning activity calendar heatmap for ${year}`}
        >
          <div style={{ gridColumn: 2, gridRow: 1 }} className="relative h-4.5 min-w-fit">
            {months.map((month) => (
              <span
                key={`${month.label}-${month.weekIndex}`}
                className="absolute top-0 -translate-x-px whitespace-nowrap font-mono text-[8px] uppercase tracking-[0.08em] text-(--text-secondary) opacity-65 dark:text-(--text-secondary)"
                style={{ left: month.weekIndex * 14 }}
              >
                {month.label}
              </span>
            ))}
          </div>

          <div
            style={{ gridColumn: 1, gridRow: 2 }}
            className="grid grid-rows-7 gap-0.75"
            aria-hidden="true"
          >
            {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((weekday, index) => (
              <span
                key={`${weekday}-${index}`}
                className="h-2.75 font-mono text-[7px] uppercase leading-2.75 tracking-[0.08em] text-(--text-secondary) opacity-60 dark:text-(--text-secondary)"
              >
                {weekday}
              </span>
            ))}
          </div>

          <div style={{ gridColumn: 2, gridRow: 2 }} className="flex min-w-fit gap-0.75">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-0.75">
                {week.map((cell, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={cn(
                      'h-2.75 w-2.75 shrink-0 cursor-default rounded-xs transition-all duration-150 hover:scale-[1.12] hover:opacity-85',
                      cell.inside
                        ? intensityClass[cell.intensityLevel]
                        : 'pointer-events-none opacity-0'
                    )}
                    title={
                      cell.inside
                        ? `${cell.date.toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            timeZone: 'UTC',
                          })} · ${cell.activityCount} activit${
                            cell.activityCount === 1 ? 'y' : 'ies'
                          }${cell.isFrozen ? ' · Streak freeze used' : ''}`
                        : ''
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center justify-end gap-1.5">
        <span className="font-mono text-[8px] text-(--text-secondary) opacity-50 dark:text-(--text-secondary)">
          Less active
        </span>
        {(['none', 'low', 'medium', 'high'] as HeatmapIntensity[]).map((level) => (
          <div key={level} className={cn('h-2.75 w-2.75 rounded-xs', intensityClass[level])} />
        ))}
        <span className="font-mono text-[8px] text-(--text-secondary) opacity-50 dark:text-(--text-secondary)">
          More active
        </span>
      </div>

      {isLoading && (
        <div className="mt-3 text-[12px] font-medium text-(--text-secondary) dark:text-(--text-secondary)">
          Loading learning activity…
        </div>
      )}
    </section>
  );
}
