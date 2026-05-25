import { useMemo } from 'react'

import type { DashboardActivityIntensityItem } from '../types/dashboard.types'
import { themedScrollbar } from '../constants/dashboard-style'
import { cn } from '../utils/cn'

type ActivityHeatmapProps = {
  activity: DashboardActivityIntensityItem[]
  months: 6 | 12
  onMonthsChange: (months: 6 | 12) => void
  isLoading?: boolean
}

function ActivityHeatmapSkeleton() {
  return (
    <div className="animate-pulse">
      <div className={cn('overflow-x-auto pb-2', themedScrollbar)}>
        <div className="grid min-w-max grid-cols-[34px_auto] grid-rows-[18px_auto] gap-x-2 gap-y-2">
          <div className="col-start-2 row-start-1 flex gap-12">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-2.5 w-8 rounded-full bg-[rgba(26,23,20,0.09)] dark:bg-white/9"
              />
            ))}
          </div>

          <div className="col-start-1 row-start-2 grid grid-rows-7 gap-0.75">
            {Array.from({ length: 7 }).map((_, index) => (
              <div
                key={index}
                className="h-2.75 w-6 rounded-full bg-[rgba(26,23,20,0.09)] dark:bg-white/9"
              />
            ))}
          </div>

          <div className="col-start-2 row-start-2 flex gap-0.75">
            {Array.from({ length: 28 }).map((_, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-0.75">
                {Array.from({ length: 7 }).map((_, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className="h-2.75 w-2.75 rounded-xs bg-[rgba(26,23,20,0.09)] dark:bg-white/9"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-6">
        <div>
          <div className="h-2 w-16 rounded-full bg-[rgba(26,23,20,0.09)] dark:bg-white/9" />
          <div className="mt-2 h-4 w-8 rounded-full bg-[rgba(26,23,20,0.09)] dark:bg-white/9" />
        </div>

        <div>
          <div className="h-2 w-20 rounded-full bg-[rgba(26,23,20,0.09)] dark:bg-white/9" />
          <div className="mt-2 h-4 w-8 rounded-full bg-[rgba(26,23,20,0.09)] dark:bg-white/9" />
        </div>
      </div>
    </div>
  )
}

export default function ActivityHeatmap({
  activity,
  months,
  onMonthsChange,
  isLoading = false,
}: ActivityHeatmapProps) {
  const { weeks, monthLabels, activeDays, totalActivities } = useMemo(() => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    const normalizedStart = new Date(startDate)
    normalizedStart.setDate(
      normalizedStart.getDate() - normalizedStart.getDay()
    )

    const normalizedEnd = new Date(endDate)
    normalizedEnd.setDate(
      normalizedEnd.getDate() + (6 - normalizedEnd.getDay())
    )

    const intensityMap = new Map(activity.map((item) => [item.date, item]))

    const builtWeeks: Date[][] = []
    const cursor = new Date(normalizedStart)

    while (cursor <= normalizedEnd) {
      const week: Date[] = []

      for (let day = 0; day < 7; day += 1) {
        week.push(new Date(cursor))
        cursor.setDate(cursor.getDate() + 1)
      }

      builtWeeks.push(week)
    }

    const labels: Array<{ label: string; left: number }> = []
    const seenMonths = new Set<string>()

    builtWeeks.forEach((week, weekIndex) => {
      week.forEach((date) => {
        const insideRange = date >= startDate && date <= endDate

        if (!insideRange) return

        const key = `${date.getFullYear()}-${date.getMonth()}`
        if (seenMonths.has(key)) return

        seenMonths.add(key)
        labels.push({
          label: date.toLocaleDateString(undefined, {
            month: 'short',
          }),
          left: weekIndex * 14,
        })
      })
    })

    return {
      weeks: builtWeeks.map((week) =>
        week.map((date) => {
          const iso = date.toISOString().split('T')[0]
          const matching = intensityMap.get(iso)
          const activityCount = matching?.activityCount ?? 0

          return {
            date,
            intensity: matching?.count ?? 0,
            activityCount,
            insideRange: date >= startDate && date <= endDate,
          }
        })
      ),
      monthLabels: labels,
      activeDays: activity.length,
      totalActivities: activity.reduce(
        (sum, item) => sum + (item.activityCount ?? 0),
        0
      ),
    }
  }, [activity, months])

  return (
    <section className="rounded-[20px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-6 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19] max-[640px]:p-4.5">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-['Playfair_Display',serif] text-[20px] font-extrabold tracking-[-0.35px] text-[#1a1714] dark:text-[#f2f0eb]">
            Activity Intensity
          </h2>
          <p className="mt-1 text-[12.5px] text-[#6b5f58] dark:text-[#9b9a92]">
            Your learning activity across the last {months} months.
          </p>
        </div>

        <div className="flex overflow-hidden rounded-[10px] border-[1.5px] border-[#e0d0c5] dark:border-white/9">
          {[6, 12].map((value) => (
            <button
              key={value}
              type="button"
              disabled={isLoading}
              onClick={() => onMonthsChange(value as 6 | 12)}
              className={cn(
                'px-3.5 py-2 font-[DM_Mono] text-[9px] uppercase tracking-[0.12em] transition disabled:cursor-not-allowed disabled:opacity-65',
                months === value
                  ? 'bg-[#b84c2b] text-[#fdf8f5] dark:bg-[#e8816a] dark:text-[#141412]'
                  : 'bg-transparent text-[#6b5f58] hover:text-[#b84c2b] dark:text-[#9b9a92] dark:hover:text-[#e8816a]'
              )}
            >
              {value}M
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <ActivityHeatmapSkeleton />
      ) : (
        <>
          <div className={cn('overflow-x-auto pb-2', themedScrollbar)}>
            <div className="grid min-w-max grid-cols-[34px_auto] grid-rows-[18px_auto] gap-x-2 gap-y-2">
              <div className="relative col-start-2 row-start-1 h-4.5">
                {monthLabels.map((item) => (
                  <span
                    key={`${item.label}-${item.left}`}
                    className="absolute top-0 whitespace-nowrap font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.08em] text-[#6b5f58] opacity-65 dark:text-[#9b9a92]"
                    style={{ left: `${item.left}px` }}
                  >
                    {item.label}
                  </span>
                ))}
              </div>

              <div className="col-start-1 row-start-2 grid grid-rows-7 gap-0.75">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                  (day) => (
                    <span
                      key={day}
                      className="h-2.75 font-['DM_Mono',monospace] text-[7px] uppercase tracking-[0.08em] leading-2.75 text-[#6b5f58] opacity-58 dark:text-[#9b9a92]"
                    >
                      {day}
                    </span>
                  )
                )}
              </div>

              <div className="col-start-2 row-start-2 flex gap-0.75">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-0.75">
                    {week.map((cell) => {
                      const activityText =
                        cell.activityCount === 1
                          ? '1 activity'
                          : `${cell.activityCount} activities`

                      return (
                        <div
                          key={cell.date.toISOString()}
                          title={`${cell.date.toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })} · ${
                            cell.activityCount > 0
                              ? activityText
                              : 'No activity'
                          }`}
                          className={cn(
                            'h-2.75 w-2.75 shrink-0 rounded-xs transition hover:scale-110 hover:opacity-85',
                            !cell.insideRange &&
                              'pointer-events-none opacity-0',
                            cell.insideRange &&
                              cell.intensity === 0 &&
                              'bg-[rgba(26,23,20,0.09)] dark:bg-[rgba(242,240,235,0.07)]',
                            cell.intensity === 1 &&
                              'bg-[rgba(184,76,43,0.18)] dark:bg-[rgba(232,129,106,0.22)]',
                            cell.intensity === 2 &&
                              'bg-[rgba(184,76,43,0.38)] dark:bg-[rgba(232,129,106,0.42)]',
                            cell.intensity === 3 &&
                              'bg-[rgba(184,76,43,0.65)] dark:bg-[rgba(232,129,106,0.68)]',
                            cell.intensity >= 4 &&
                              'bg-[#b84c2b] dark:bg-[#e8816a]'
                          )}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-6">
            <div>
              <div className="font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-[0.14em] text-[#6b5f58] opacity-50 dark:text-[#9b9a92]">
                Active Days
              </div>
              <div className="mt-1 text-[14px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
                {activeDays}
              </div>
            </div>

            <div>
              <div className="font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-[0.14em] text-[#6b5f58] opacity-50 dark:text-[#9b9a92]">
                Total Activities
              </div>
              <div className="mt-1 text-[14px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
                {totalActivities}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  )
}