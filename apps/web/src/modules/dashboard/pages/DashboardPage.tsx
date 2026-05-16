// apps/web/src/modules/dashboard/pages/DashboardPage.tsx

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../../components/layout/Sidebar'
import TopBar from '../../../components/layout/TopBar'
import AppFooter from '../../../components/layout/Footer'
import BottomNav from '../../../components/layout/BottomNav'

import { useDashboardSummary } from '../../../hooks/dashboard/useDashboardSummary'
import { useCurrentDashboardRoadmap } from '../../../hooks/dashboard/useCurrentDashboardRoadmap'
import { useDashboardActivityIntensity } from '../../../hooks/dashboard/useDashboardActivityIntensity'
import { useDashboardRecentBattles } from '../../../hooks/dashboard/useDashboardRecentBattles'
import { useDashboardFriendsHub } from '../../../hooks/dashboard/useDashboardFriendsHub'
import { useDashboardRecommendedActions } from '../../../hooks/dashboard/useDashboardRecommendedActions'
import { useDashboardAIInsights } from '../../../hooks/dashboard/useDashboardAIInsights'
import { useDashboardStore } from '../../../store/useDashboardStore'

import type {
  DashboardActivityIntensityItem,
  DashboardFriend,
  DashboardRecentBattle,
  DashboardRecommendedAction,
} from '../../../types/dashboard.types'

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

const themedScrollbar =
  "[scrollbar-width:thin] [scrollbar-color:rgba(184,76,43,0.28)_transparent] dark:[scrollbar-color:rgba(232,129,106,0.34)_transparent] [&::-webkit-scrollbar]:h-[6px] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[rgba(184,76,43,0.28)] dark:[&::-webkit-scrollbar-thumb]:bg-[rgba(232,129,106,0.34)]"

const formatCompactNumber = (
  value: number | string | null | undefined
) => {
  const numeric = Number(value ?? 0)

  if (!Number.isFinite(numeric)) return '0'

  return new Intl.NumberFormat(undefined, {
    notation: numeric >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: numeric >= 1000 ? 1 : 0,
  }).format(numeric)
}

const formatStudyMinutes = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`

  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60

  return rest > 0 ? `${hours}h ${rest}m` : `${hours}h`
}

const formatRelativeTime = (
  value: string | Date | null | undefined
) => {
  if (!value) return 'Recently'

  const date = new Date(value)
  const time = date.getTime()

  if (Number.isNaN(time)) return 'Recently'

  const diffMs = Date.now() - time
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000))

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} min ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} hr ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
  }

  const diffWeeks = Math.floor(diffDays / 7)
  if (diffWeeks < 5) {
    return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const formatLevelLabel = (isPremium: boolean) =>
  isPremium ? 'Imminiq Pro' : 'Free Scholar'

function StatCard({
  accent,
  label,
  value,
  footer,
}: {
  accent: 'rust' | 'green' | 'amber' | 'blue'
  label: string
  value: string
  footer: React.ReactNode
}) {
  const accentClass = {
    rust: 'from-[#e8816a] to-[#b84c2b]',
    green: 'from-[#70d49a] to-[#4caf7d]',
    amber: 'from-[#e8c060] to-[#c98000]',
    blue: 'from-[#7aa4e8] to-[#3b6cb7]',
  }[accent]

  return (
    <div className="relative overflow-hidden rounded-2xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] transition hover:-translate-y-0.5 hover:border-[rgba(184,76,43,0.20)] hover:shadow-[0_10px_40px_rgba(26,23,20,0.10)] dark:border-white/9 dark:bg-[#1e1c19]">
      <div
        className={cn(
          'absolute left-0 right-0 top-0 h-[2.5px] rounded-t-2xl bg-linear-to-r',
          accentClass
        )}
      />

      <div className="mb-2 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.14em] text-[#6b5f58] opacity-55 dark:text-[#9b9a92]">
        {label}
      </div>

      <div className="font-['Playfair_Display',serif] text-[clamp(30px,4vw,40px)] font-extrabold leading-none tracking-[-2px] text-[#1a1714] dark:text-[#f2f0eb]">
        {value}
      </div>

      <div className="mt-2">{footer}</div>
    </div>
  )
}

function EmptyCard({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border-[1.5px] border-dashed border-[#e0d0c5] bg-[#fdf8f5]/70 px-5 py-6 text-center dark:border-white/9 dark:bg-[#1e1c19]/70">
      <div className="text-[14px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
        {title}
      </div>
      <div className="mt-1 text-[12.5px] leading-[1.6] text-[#6b5f58] dark:text-[#9b9a92]">
        {description}
      </div>
    </div>
  )
}

function FriendsCard({
  friends,
  onOpenCommunity,
}: {
  friends: DashboardFriend[]
  onOpenCommunity: () => void
}) {
  const onlineCount = friends.filter((friend) => friend.isOnline).length

  return (
    <section className="flex flex-col gap-4 rounded-[20px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-['Playfair_Display',serif] text-[18px] font-extrabold tracking-[-0.3px] text-[#1a1714] dark:text-[#f2f0eb]">
          Friends Hub
        </h2>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(45,106,71,0.20)] bg-[rgba(45,106,71,0.08)] px-2.5 py-1 font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.10em] text-[#4caf7d] dark:border-[rgba(92,201,138,0.22)] dark:bg-[rgba(92,201,138,0.10)] dark:text-[#5cc98a]">
          <span className="h-1.25 w-1.25 rounded-full bg-[#4caf7d] dark:bg-[#5cc98a]" />
          {onlineCount} online
        </span>
      </div>

      {friends.length === 0 ? (
        <EmptyCard
          title="No friends yet"
          description="Connect with other learners to see their activity here."
        />
      ) : (
        <div className="flex flex-col gap-1">
          {friends.map((friend) => (
            <div
              key={friend._id}
              className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-2.25 transition hover:bg-[rgba(184,76,43,0.04)] dark:hover:bg-[rgba(232,129,106,0.05)]"
            >
              <div className="relative flex h-8.5 w-8.5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-[#b84c2b] to-[#e8816a] text-[11px] font-bold text-white">
                {friend.avatarUrl ? (
                  <img
                    src={friend.avatarUrl}
                    alt={friend.fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(friend.fullName)
                )}

                <span
                  className={cn(
                    'absolute bottom-0.25 right-0.25 h-2 w-2 rounded-full border-2 border-[#fdf8f5] dark:border-[#1e1c19]',
                    friend.isOnline
                      ? 'bg-[#4caf7d]'
                      : 'bg-[#6b5f58]/50 dark:bg-[#9b9a92]/50'
                  )}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold text-[#1a1714] dark:text-[#f2f0eb]">
                  {friend.fullName}
                </div>
                <div className="truncate text-[11px] text-[#6b5f58] dark:text-[#9b9a92]">
                  @{friend.username} ·{' '}
                  {friend.isOnline
                    ? 'Online now'
                    : formatRelativeTime(friend.lastActiveAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onOpenCommunity}
        className="rounded-[10px] border-[1.5px] border-[#e0d0c5] px-4 py-2.5 text-[13px] font-semibold text-[#6b5f58] transition hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] dark:border-white/9 dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
      >
        View Friends
      </button>
    </section>
  )
}

function ActivityHeatmap({
  activity,
  months,
  onMonthsChange,
}: {
  activity: DashboardActivityIntensityItem[]
  months: 6 | 12
  onMonthsChange: (months: 6 | 12) => void
}) {
  const { weeks, monthLabels, activeDays, totalMinutes } = useMemo(() => {
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

    const intensityMap = new Map(
      activity.map((item) => [item.date, item])
    )

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
        const insideRange =
          date >= startDate && date <= endDate

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

          return {
            date,
            intensity: matching?.count ?? 0,
            minutes: matching?.minutes ?? 0,
            insideRange: date >= startDate && date <= endDate,
          }
        })
      ),
      monthLabels: labels,
      activeDays: activity.length,
      totalMinutes: activity.reduce(
        (sum, item) => sum + item.minutes,
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
            Your study activity across the last {months} months.
          </p>
        </div>

        <div className="flex overflow-hidden rounded-[10px] border-[1.5px] border-[#e0d0c5] dark:border-white/9">
          {[6, 12].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onMonthsChange(value as 6 | 12)}
              className={cn(
                'px-3.5 py-2 font-[DM_Mono] text-[9px] uppercase tracking-[0.12em] transition',
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

      <div className={cn('overflow-x-auto pb-2', themedScrollbar)}>
        <div className="grid min-w-max grid-cols-[34px_auto] grid-rows-[18px_auto] gap-x-2 gap-y-2">
          <div className="relative col-start-2 row-start-1 h-[18px]">
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

          <div className="col-start-1 row-start-2 grid grid-rows-7 gap-[3px]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
              (day) => (
                <span
                  key={day}
                  className="h-[11px] font-['DM_Mono',monospace] text-[7px] uppercase tracking-[0.08em] leading-[11px] text-[#6b5f58] opacity-58 dark:text-[#9b9a92]"
                >
                  {day}
                </span>
              )
            )}
          </div>

          <div className="col-start-2 row-start-2 flex gap-[3px]">
            {weeks.map((week, weekIndex) => (
              <div
                key={weekIndex}
                className="flex flex-col gap-[3px]"
              >
                {week.map((cell) => (
                  <div
                    key={cell.date.toISOString()}
                    title={`${cell.date.toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })} · ${
                      cell.minutes > 0
                        ? `${cell.minutes} study minutes`
                        : 'No activity'
                    }`}
                    className={cn(
                      'h-[11px] w-[11px] shrink-0 rounded-[2px] transition hover:scale-110 hover:opacity-85',
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
                ))}
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
            Focus Time
          </div>
          <div className="mt-1 text-[14px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
            {formatStudyMinutes(totalMinutes)}
          </div>
        </div>
      </div>
    </section>
  )
}

function RecentBattles({
  battles,
}: {
  battles: DashboardRecentBattle[]
}) {
  return (
    <section>
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="font-['Playfair_Display',serif] text-[clamp(20px,3vw,24px)] font-extrabold tracking-[-0.4px] text-[#1a1714] dark:text-[#f2f0eb]">
          Recent Battles
        </h2>
      </div>

      {battles.length === 0 ? (
        <EmptyCard
          title="No battles completed yet"
          description="Your recent challenge battles will appear here once completed."
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {battles.map((battle) => (
            <div
              key={battle._id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] px-5 py-4 shadow-[0_2px_16px_rgba(26,23,20,0.06)] transition hover:-translate-y-0.5 hover:border-[rgba(184,76,43,0.20)] hover:shadow-[0_10px_40px_rgba(26,23,20,0.10)] dark:border-white/9 dark:bg-[#1e1c19]"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-[1.5px] border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
                ⚔️
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
                  Battle vs{' '}
                  {battle.opponent?.fullName ?? 'Unknown Opponent'}
                </div>
                <div className="mt-0.5 font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.08em] text-[#6b5f58] opacity-55 dark:text-[#9b9a92]">
                  Completed {formatRelativeTime(battle.completedAt)}
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-[#3b6cb7] to-[#7aa4e8] text-[8px] font-bold text-white">
                    {battle.opponent?.avatarUrl ? (
                      <img
                        src={battle.opponent.avatarUrl}
                        alt={battle.opponent.fullName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      getInitials(
                        battle.opponent?.fullName ?? 'Unknown Opponent'
                      )
                    )}
                  </div>

                  <span className="text-[12.5px] font-semibold text-[#1a1714] dark:text-[#f2f0eb]">
                    @{battle.opponent?.username ?? 'unknown'}
                  </span>
                </div>

                <span
                  className={cn(
                    'rounded-full border px-3 py-1 font-["DM_Mono",monospace] text-[8.5px] uppercase tracking-[0.12em]',
                    battle.result === 'win' &&
                      'border-[rgba(45,106,71,0.22)] bg-[rgba(45,106,71,0.10)] text-[#2d6a47] dark:border-[rgba(92,201,138,0.22)] dark:bg-[rgba(92,201,138,0.10)] dark:text-[#5cc98a]',
                    battle.result === 'loss' &&
                      'border-[rgba(200,50,50,0.22)] bg-[rgba(200,50,50,0.10)] text-[#b83232] dark:border-[rgba(220,80,80,0.22)] dark:bg-[rgba(220,80,80,0.10)] dark:text-[#e05252]',
                    battle.result === 'draw' &&
                      'border-[#e0d0c5] bg-[rgba(26,23,20,0.05)] text-[#6b5f58] dark:border-white/9 dark:bg-white/[0.06] dark:text-[#9b9a92]'
                  )}
                >
                  {battle.result}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function RecommendedActions({
  actions,
  onNavigate,
}: {
  actions: DashboardRecommendedAction[]
  onNavigate: (link: string) => void
}) {
  if (actions.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2.5">
      {actions.map((action, index) => (
        <button
          key={`${action.type}-${action.link}`}
          type="button"
          onClick={() => onNavigate(action.link)}
          className={cn(
            'inline-flex items-center gap-2 rounded-[10px] border-[1.5px] px-4.5 py-2.5 text-[12.5px] font-semibold shadow-[0_2px_16px_rgba(26,23,20,0.06)] transition hover:-translate-y-px',
            index === 0
              ? 'border-[#b84c2b] bg-[#b84c2b] text-[#fdf8f5] hover:bg-[#963d22] dark:border-[#e8816a] dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]'
              : 'border-[#e0d0c5] bg-[#fdf8f5] text-[#6b5f58] hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] dark:border-white/9 dark:bg-[#1e1c19] dark:text-[#9b9a92] dark:hover:text-[#e8816a]'
          )}
        >
          {action.title}
        </button>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () =>
      typeof window !== 'undefined' &&
      localStorage.getItem('imminiq_sb') === 'closed'
  )

  const activityMonths = useDashboardStore(
    (state) => state.activityMonths
  )
  const setActivityMonths = useDashboardStore(
    (state) => state.setActivityMonths
  )
  const dailyInsightDismissed = useDashboardStore(
    (state) => state.dailyInsightDismissed
  )
  const dismissDailyInsight = useDashboardStore(
    (state) => state.dismissDailyInsight
  )

  const summaryQuery = useDashboardSummary()
  const roadmapQuery = useCurrentDashboardRoadmap()
  const activityQuery =
    useDashboardActivityIntensity(activityMonths)
  const battlesQuery = useDashboardRecentBattles(3)
  const friendsQuery = useDashboardFriendsHub(4)
  const actionsQuery = useDashboardRecommendedActions()
  const insightQuery = useDashboardAIInsights()

  const summary = summaryQuery.data
  const currentRoadmap = roadmapQuery.data
  const activity = activityQuery.data ?? []
  const battles = battlesQuery.data ?? []
  const friends = friendsQuery.data ?? []
  const actions = actionsQuery.data ?? []
  const aiInsight = insightQuery.data?.insight

  const isLoading =
    summaryQuery.isLoading ||
    roadmapQuery.isLoading ||
    activityQuery.isLoading ||
    battlesQuery.isLoading ||
    friendsQuery.isLoading ||
    actionsQuery.isLoading

  const hasError =
    summaryQuery.isError ||
    roadmapQuery.isError ||
    activityQuery.isError ||
    battlesQuery.isError ||
    friendsQuery.isError ||
    actionsQuery.isError

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5ede4] dark:bg-[#141412]">
        <div className="rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] px-6 py-5 text-[14px] font-semibold text-[#1a1714] shadow-[0_10px_40px_rgba(26,23,20,0.10)] dark:border-white/9 dark:bg-[#1e1c19] dark:text-[#f2f0eb]">
          Loading dashboard…
        </div>
      </div>
    )
  }

  if (hasError || !summary) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5ede4] px-4 dark:bg-[#141412]">
        <div className="max-w-md rounded-2xl border border-[rgba(200,50,50,0.22)] bg-[#fdf8f5] p-6 text-center shadow-[0_10px_40px_rgba(26,23,20,0.10)] dark:bg-[#1e1c19]">
          <h1 className="font-['Playfair_Display',serif] text-[22px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
            Dashboard unavailable
          </h1>
          <p className="mt-2 text-[13px] leading-[1.6] text-[#6b5f58] dark:text-[#9b9a92]">
            Something went wrong while fetching your dashboard data.
          </p>
        </div>
      </div>
    )
  }

  const userInitials = getInitials(summary.user.fullName)
  const progress = currentRoadmap?.completionPercentage ?? 0

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#f5ede4] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]">
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025] dark:opacity-[0.04]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")',
          backgroundSize: '180px',
        }}
      />

      <div className="relative z-1 flex min-h-screen w-full overflow-x-clip">
        <Sidebar
          mobileOpen={sidebarOpen}
          collapsed={sidebarCollapsed}
          onCloseMobile={() => setSidebarOpen(false)}
          onToggleCollapsed={() =>
            setSidebarCollapsed((value) => {
              const next = !value

              localStorage.setItem(
                'imminiq_sb',
                next ? 'closed' : 'open'
              )

              return next
            })
          }
        />

        <main
          className={cn(
            'flex min-w-0 flex-1 flex-col overflow-x-clip transition-[margin] duration-300',
            sidebarCollapsed
              ? 'min-[901px]:ml-0'
              : 'min-[901px]:ml-56'
          )}
        >
          <TopBar
            onMenuClick={() => setSidebarOpen(true)}
            streakDays={summary.streak.current}
            userName={summary.user.fullName}
            userInitials={userInitials}
            userAvatarUrl={summary.user.avatarUrl || undefined}
            userLevel={formatLevelLabel(summary.user.isPremium)}
            isGuest={false}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="mx-auto mt-5.5 flex w-[min(1180px,calc(100%-48px))] max-w-full min-w-0 flex-col gap-6 pb-[calc(80px+env(safe-area-inset-bottom,0px)+16px)] max-[900px]:mt-4.5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[640px]:mt-3 max-[640px]:w-[calc(100%-20px)]">
              {/* Welcome */}
              <section className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-3 py-1 font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.12em] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
                    <span className="h-1.25 w-1.25 rounded-full bg-[#4caf7d] dark:bg-[#5cc98a]" />
                    Dashboard Overview
                  </div>

                  <h1 className="font-['Playfair_Display',serif] text-[clamp(26px,3.5vw,38px)] font-extrabold leading-[1.15] tracking-[-0.8px] text-[#1a1714] dark:text-[#f2f0eb]">
                    Welcome back,{' '}
                    <span className="text-[#b84c2b] dark:text-[#e8816a]">
                      {summary.user.fullName.split(' ')[0]}
                    </span>
                  </h1>

                  <p className="mt-2 max-w-[460px] text-[13px] italic leading-[1.55] text-[#6b5f58] opacity-80 dark:text-[#9b9a92]">
                    Every focused session compounds. Keep your roadmap moving
                    forward today.
                  </p>
                </div>

                <div className="relative flex min-w-[190px] items-center gap-4 overflow-hidden rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] px-5 py-4 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border-[1.5px] border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] text-[20px]">
                    🔥
                  </div>

                  <div>
                    <div className="font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-[0.14em] text-[#6b5f58] opacity-55 dark:text-[#9b9a92]">
                      Current Streak
                    </div>
                    <div className="font-['Playfair_Display',serif] text-[28px] font-extrabold leading-none tracking-[-1.5px] text-[#1a1714] dark:text-[#f2f0eb]">
                      {summary.streak.current}d
                    </div>
                  </div>
                </div>
              </section>

              {/* Quick Actions */}
              <RecommendedActions
                actions={actions}
                onNavigate={navigate}
              />

              {/* Stats */}
              <section className="grid grid-cols-4 gap-3 max-[860px]:grid-cols-2 max-[440px]:gap-2">
                <StatCard
                  accent="rust"
                  label="Total Trackers"
                  value={formatCompactNumber(summary.trackers.total)}
                  footer={
                    <span className="inline-flex rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-2.5 py-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.08em] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
                      {summary.trackers.active} active
                    </span>
                  }
                />

                <StatCard
                  accent="green"
                  label="Completed"
                  value={formatCompactNumber(summary.trackers.completed)}
                  footer={
                    <span className="inline-flex rounded-full border border-[rgba(45,106,71,0.20)] bg-[rgba(45,106,71,0.08)] px-2.5 py-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.08em] text-[#2d6a47] dark:border-[rgba(92,201,138,0.22)] dark:bg-[rgba(92,201,138,0.10)] dark:text-[#5cc98a]">
                      Roadmaps finished
                    </span>
                  }
                />

                <StatCard
                  accent="amber"
                  label="Study Time"
                  value={formatStudyMinutes(
                    summary.stats.totalTimeSpentMinutes
                  )}
                  footer={
                    <span className="text-[11px] text-[#6b5f58] dark:text-[#9b9a92]">
                      Across all trackers
                    </span>
                  }
                />

                <StatCard
                  accent="blue"
                  label="Coins"
                  value={formatCompactNumber(summary.user.coinBalance)}
                  footer={
                    <span className="text-[11px] text-[#6b5f58] dark:text-[#9b9a92]">
                      Rewards balance
                    </span>
                  }
                />
              </section>

              {/* Main two-col */}
              <section className="grid grid-cols-[1fr_300px] gap-4 max-[900px]:grid-cols-1">
                <div className="rounded-[20px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-6 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19] max-[640px]:p-4.5">
                  <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.15em] text-[#6b5f58] opacity-55 dark:text-[#9b9a92]">
                        Current Roadmap
                      </div>

                      <h2 className="font-['Playfair_Display',serif] text-[22px] font-extrabold tracking-[-0.4px] text-[#1a1714] dark:text-[#f2f0eb]">
                        {currentRoadmap?.title ?? 'No active roadmap'}
                      </h2>

                      <p className="mt-1 text-[12.5px] text-[#6b5f58] dark:text-[#9b9a92]">
                        {currentRoadmap
                          ? `${currentRoadmap.level} level · last studied ${formatRelativeTime(
                              currentRoadmap.lastStudiedAt
                            )}`
                          : 'Create a tracker to start your personalized learning path.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          currentRoadmap
                            ? `/trackers/${currentRoadmap._id}`
                            : '/onboarding/step-1'
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-[10px] bg-[#b84c2b] px-5 py-2.5 text-[13px] font-bold text-[#fdf8f5] transition hover:-translate-y-px hover:bg-[#963d22] hover:shadow-[0_8px_24px_rgba(184,76,43,0.28)] dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]"
                    >
                      {currentRoadmap ? 'Continue' : 'Create Tracker'}
                    </button>
                  </div>

                  {currentRoadmap ? (
                    <>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[13px] font-semibold text-[#1a1714] dark:text-[#f2f0eb]">
                          Completion Progress
                        </span>
                        <span className="font-['DM_Mono',monospace] text-[11px] tracking-[0.04em] text-[#b84c2b] dark:text-[#e8816a]">
                          {Math.round(progress)}%
                        </span>
                      </div>

                      <div className="h-1.75 overflow-hidden rounded-full bg-[rgba(26,23,20,0.09)] dark:bg-white/[0.09]">
                        <div
                          className="h-full rounded-full bg-linear-to-r from-[#e8816a] to-[#b84c2b] transition-all duration-700 dark:from-[#f5a090] dark:to-[#e8816a]"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <span className="rounded-full border border-[#e0d0c5] px-3.5 py-1.75 text-[12px] font-medium text-[#6b5f58] dark:border-white/9 dark:text-[#9b9a92]">
                          {summary.stats.totalSubtopicsCompleted} subtopics
                          completed
                        </span>

                        <span className="rounded-full border border-[#e0d0c5] px-3.5 py-1.75 text-[12px] font-medium text-[#6b5f58] dark:border-white/9 dark:text-[#9b9a92]">
                          {summary.stats.publishedTrackers} published
                        </span>
                      </div>
                    </>
                  ) : (
                    <EmptyCard
                      title="Your dashboard is ready"
                      description="Generate your first roadmap to unlock active progress, study heatmaps, and recommendations."
                    />
                  )}
                </div>

                <FriendsCard
                  friends={friends}
                  onOpenCommunity={() => navigate('/community')}
                />
              </section>

              <ActivityHeatmap
                activity={activity}
                months={activityMonths}
                onMonthsChange={setActivityMonths}
              />

              <RecentBattles battles={battles} />

              {!dailyInsightDismissed && (
                <section className="relative flex flex-wrap items-center gap-4 overflow-hidden rounded-2xl bg-linear-to-br from-[#b84c2b] to-[#963d22] px-5.5 py-4 shadow-[0_8px_32px_rgba(184,76,43,0.28)]">
                  <div className="relative z-1 text-[26px]">💡</div>

                  <div className="relative z-1 min-w-0 flex-1">
                    <div className="mb-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.18em] text-white/65">
                      AI Daily Insight
                    </div>

                    <div className="text-[13.5px] font-semibold leading-[1.5] text-white">
                      {aiInsight ??
                        'Keep your streak alive by completing at least one learning step today.'}
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-label="Dismiss insight"
                    onClick={dismissDailyInsight}
                    className="relative z-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-[1.5px] border-white/25 text-white/75 transition hover:bg-white/15 hover:text-white"
                  >
                    ×
                  </button>
                </section>
              )}
            </div>

            <AppFooter />
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  )
}