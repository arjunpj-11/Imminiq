import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react'

import Sidebar from '../../../components/layout/Sidebar'
import TopBar from '../../../components/layout/TopBar'
import AppFooter from '../../../components/layout/Footer'
import BottomNav from '../../../components/layout/BottomNav'

// ── Helpers ───────────────────────────────────────────────────────────────

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

const getInitials = (name: string) =>
  name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

const formatLevelLabel = (isPremium: boolean) =>
  isPremium ? 'Imminiq Pro' : 'Free Scholar'

const formatCompactNumber = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : String(n)

// ── Types ─────────────────────────────────────────────────────────────────

type ActivityFilter = 'All' | 'Trackers' | 'Mock Tests' | 'Community'
type HeatmapIntensity = 'none' | 'low' | 'medium' | 'high'

interface HeatmapItem {
  date: string
  intensityLevel: HeatmapIntensity
  activityCount: number
  isFrozen?: boolean
}

interface StreakSummary {
  currentStreak: number
  longestStreak: number
  heatmap: HeatmapItem[]
}

interface HeatmapCell {
  date: Date
  inside: boolean
  intensityLevel: HeatmapIntensity
  activityCount: number
  isFrozen: boolean
}

interface ActivityEvent {
  id: string
  type: 'tracker' | 'mock_test' | 'community' | 'streak' | 'xp_milestone'
  title: string
  subtitle: string
  xp: number
  timestamp: string
  date: string
  icon: 'tracker' | 'test' | 'community' | 'fire' | 'star'
}

interface WeekStat {
  label: string
  xp: number
  sessions: number
}

interface DashboardUser {
  fullName: string
  avatarUrl: string | null
  isPremium: boolean
}

interface DashboardSummaryData {
  user: DashboardUser
  streak: { current: number }
}

// ── SVG Icon system ───────────────────────────────────────────────────────

const Icon = {
  Fire: ({ size = 14, className = '' }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M12 2s-4.5 4.5-4.5 9a4.5 4.5 0 0 0 9 0C16.5 6.5 12 2 12 2Z" fill="currentColor" />
      <path d="M9.5 14.5C9.5 13.12 10.62 12 12 12s2.5 1.12 2.5 2.5c0 .83-.4 1.56-1.01 2.02" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity=".5" />
    </svg>
  ),
  TrendUp: ({ size = 12 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 17l5-5 4 4 7-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 8h5v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Sparkles: ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2Z" fill="currentColor" />
      <path d="M5 15l.9 3.1L9 19l-3.1.9L5 23l-.9-3.1L1 19l3.1-.9L5 15Z" fill="currentColor" opacity=".5" />
      <path d="M19 2l.6 2.4L22 5l-2.4.6L19 8l-.6-2.4L16 5l2.4-.6L19 2Z" fill="currentColor" opacity=".5" />
    </svg>
  ),
  Trophy: ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 9H4a2 2 0 01-2-2V5h4M18 9h2a2 2 0 002-2V5h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 5h12v5a6 6 0 01-12 0V5z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 16v4M8 20h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  GraduationCap: ({ size = 15 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3L1 9l11 6 9-4.91V17" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 12.5V17c0 0 2.5 3 7 3s7-3 7-3v-4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  ClipboardCheck: ({ size = 15 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M9 3h6M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Users: ({ size = 15 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.75" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  ),
  Star: ({ size = 13 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
    </svg>
  ),
  Activity: ({ size = 15 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Calendar: ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Lightning: ({ size = 13 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M13 2L4.5 13.5H11L11 22L19.5 10.5H13L13 2Z" fill="currentColor" />
    </svg>
  ),
  LiveDot: () => (
    <svg width="7" height="7" viewBox="0 0 7 7" aria-hidden="true">
      <circle cx="3.5" cy="3.5" r="3.5" fill="#4caf7d" />
    </svg>
  ),
}

// ── Noise overlay ─────────────────────────────────────────────────────────

const NoiseOverlay = () => (
  <div
    className="pointer-events-none fixed inset-0 z-0 opacity-[0.022] dark:opacity-[0.04]"
    style={{
      backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
      backgroundSize: '180px',
    }}
  />
)

// ── Skeleton ──────────────────────────────────────────────────────────────

const SkeletonBlock = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse rounded-full bg-[#e8ddd6] dark:bg-white/10', className)} />
)

const PageSkeleton = ({
  sidebarOpen, sidebarCollapsed, setSidebarOpen, setSidebarCollapsed,
}: {
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  setSidebarOpen: (v: boolean) => void
  setSidebarCollapsed: Dispatch<SetStateAction<boolean>>
}) => (
  <div className="relative min-h-screen overflow-x-clip bg-[#f5ede4] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]" role="status" aria-live="polite" aria-label="Loading activity">
    <NoiseOverlay />
    <div className="relative z-1 flex min-h-screen w-full overflow-x-clip">
      <Sidebar
        mobileOpen={sidebarOpen}
        collapsed={sidebarCollapsed}
        onCloseMobile={() => setSidebarOpen(false)}
        onToggleCollapsed={() => setSidebarCollapsed((v) => { const n = !v; localStorage.setItem('imminiq_sb', n ? 'closed' : 'open'); return n })}
      />
      <main className={cn('flex min-w-0 flex-1 flex-col overflow-x-clip transition-[margin] duration-300', sidebarCollapsed ? 'min-[901px]:ml-0' : 'min-[901px]:ml-56')}>
        <TopBar onMenuClick={() => setSidebarOpen(true)} streakDays={0} userName="Loading" userInitials="IM" userLevel="Loading" isGuest={false} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mx-auto mt-5.5 flex w-[min(1180px,calc(100%-48px))] max-w-full min-w-0 flex-col gap-6 pb-32">
            <div className="space-y-3">
              <SkeletonBlock className="h-4 w-16" />
              <SkeletonBlock className="h-10 w-72 rounded-2xl" />
              <SkeletonBlock className="h-4 w-96" />
            </div>
            <div className="grid grid-cols-4 gap-3 max-[700px]:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-32.5 rounded-2xl" />
              ))}
            </div>
            <SkeletonBlock className="h-52 rounded-[18px]" />
          </div>
          <AppFooter />
        </div>
      </main>
    </div>
    <BottomNav />
  </div>
)

// ── DashboardStatsGrid (from real component) ──────────────────────────────

const STAT_ACCENT_COLORS = [
  { light: '#b84c2b', dark: '#e8816a' },
  { light: '#2d6a47', dark: '#3dbf82' },
  { light: '#c98000', dark: '#f0a832' },
  { light: '#3b6cb7', dark: '#4a9eff' },
]

const StatCard = ({
  label,
  value,
  hint,
  accent,
}: {
  label: string
  value: string | number
  hint: string
  accent: { light: string; dark: string }
}) => (
  <div className="group relative overflow-hidden rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] transition hover:-translate-y-0.5 hover:border-[rgba(184,76,43,0.20)] hover:shadow-[0_10px_40px_rgba(26,23,20,0.10)] dark:border-white/10 dark:bg-[#1c1a18] dark:hover:border-white/20">
    {/* Top accent bar — light */}
    <div
      className="absolute inset-x-0 top-0 h-[2.5px] dark:hidden"
      style={{ background: `linear-gradient(90deg, transparent, ${accent.light}, transparent)` }}
    />
    {/* Top accent bar — dark */}
    <div
      className="absolute inset-x-0 top-0 hidden h-[2.5px] dark:block"
      style={{ background: `linear-gradient(90deg, transparent, ${accent.dark}, transparent)` }}
    />

    <div className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.14em] text-[#6b5f58] opacity-70 dark:text-[#9b9a92]">
      {label}
    </div>
    <div className="mt-4 font-['Playfair_Display',serif] text-[30px] font-black leading-none tracking-[-1.5px] text-[#1a1714] dark:text-[#f2f0eb] sm:text-[34px]">
      {value}
    </div>
    <p className="mt-3 text-[12px] leading-normal text-[#6b5f58] dark:text-[#9b9a92]">
      {hint}
    </p>
  </div>
)

interface ActivityStatsProps {
  totalXp: number
  sessions: number
  subtopicsDone: number
  testsAttempted: number
  totalQuestions: number
}

const ActivityStatsGrid = ({ totalXp, sessions, subtopicsDone, testsAttempted, totalQuestions }: ActivityStatsProps) => {
  const cards = [
    { label: 'Total XP',        value: formatCompactNumber(totalXp),        hint: 'All time earned' },
    { label: 'Sessions',         value: formatCompactNumber(sessions),        hint: 'Learning sessions' },
    { label: 'Subtopics Done',   value: formatCompactNumber(subtopicsDone),   hint: 'Across all trackers' },
    { label: 'Tests Attempted',  value: formatCompactNumber(testsAttempted),  hint: `${totalQuestions} questions total` },
  ]
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, i) => (
        <StatCard key={card.label} {...card} accent={STAT_ACCENT_COLORS[i % STAT_ACCENT_COLORS.length]} />
      ))}
    </section>
  )
}

// ── HeapTile (from real component, inlined) ───────────────────────────────

const intensityClass: Record<HeatmapIntensity, string> = {
  none:   'bg-[rgba(26,23,20,0.09)] dark:bg-[rgba(242,240,235,0.07)]',
  low:    'bg-[rgba(184,76,43,0.18)] dark:bg-[rgba(232,129,106,0.22)]',
  medium: 'bg-[rgba(184,76,43,0.38)] dark:bg-[rgba(232,129,106,0.42)]',
  high:   'bg-[#b84c2b] dark:bg-[#e8816a]',
}

const toDateKey = (value: Date) => value.toISOString().slice(0, 10)

function resolveAccountStartYear(accountCreatedAt?: string | Date | null) {
  const currentYear = new Date().getFullYear()
  if (!accountCreatedAt) return currentYear
  const accountDate = new Date(accountCreatedAt)
  if (Number.isNaN(accountDate.getTime())) return currentYear
  return Math.min(Math.max(accountDate.getFullYear(), 2000), currentYear)
}

function buildHeatmap(year: number, streak?: StreakSummary) {
  const first = new Date(Date.UTC(year, 0, 1))
  const last  = new Date(Date.UTC(year, 11, 31))

  const start = new Date(first)
  start.setUTCDate(start.getUTCDate() - start.getUTCDay())

  const end = new Date(last)
  end.setUTCDate(end.getUTCDate() + (6 - end.getUTCDay()))

  const heatmapByDate = new Map(
    (streak?.heatmap ?? []).map((item) => [item.date, item]),
  )

  const weeks: HeatmapCell[][] = []
  const cursor = new Date(start)

  while (cursor <= end) {
    const week: HeatmapCell[] = []
    for (let day = 0; day < 7; day++) {
      const date = new Date(cursor)
      const inside = date.getUTCFullYear() === year
      const match  = heatmapByDate.get(toDateKey(date))
      week.push({
        date,
        inside,
        intensityLevel: match?.intensityLevel ?? 'none',
        activityCount:  match?.activityCount  ?? 0,
        isFrozen:       Boolean(match?.isFrozen),
      })
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    }
    weeks.push(week)
  }

  const months = Array.from({ length: 12 }, (_, monthIndex) => {
    const monthStart    = new Date(Date.UTC(year, monthIndex, 1))
    const daysFromStart = Math.round((monthStart.getTime() - start.getTime()) / 86400000)
    return {
      label:     monthStart.toLocaleDateString(undefined, { month: 'short', timeZone: 'UTC' }),
      weekIndex: Math.floor(daysFromStart / 7),
    }
  })

  return { weeks, months }
}

const HeapTile = ({
  streak,
  year,
  onYearChange,
  isLoading = false,
  accountCreatedAt,
}: {
  streak?: StreakSummary
  year: number
  onYearChange: (year: number) => void
  isLoading?: boolean
  accountCreatedAt?: string | Date | null
}) => {
  const currentYear      = new Date().getFullYear()
  const accountStartYear = resolveAccountStartYear(accountCreatedAt)
  const scrollRef        = useRef<HTMLDivElement>(null)

  const years = useMemo(
    () => Array.from({ length: currentYear - accountStartYear + 1 }, (_, i) => currentYear - i),
    [accountStartYear, currentYear],
  )

  useEffect(() => {
    if (!years.includes(year)) onYearChange(years[0] ?? currentYear)
  }, [currentYear, onYearChange, year, years])

  useEffect(() => {
    if (scrollRef.current && year === currentYear) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [currentYear, year])

  const { weeks, months } = useMemo(() => buildHeatmap(year, streak), [streak, year])

  return (
    <section className="rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_2px_16px_rgba(26,23,20,0.06),0_1px_3px_rgba(26,23,20,0.04)] dark:border-white/9 dark:bg-[#1e1c19] dark:shadow-[0_4px_24px_rgba(0,0,0,0.28),0_1px_4px_rgba(0,0,0,0.18)] max-[640px]:p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3.5">
        <div className="flex items-center gap-2">
          <span className="text-[#b84c2b] dark:text-[#e8816a]">
            <Icon.Calendar size={16} />
          </span>
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

          <div className="flex min-w-27 flex-col gap-1">
            <label className="text-right font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-[0.14em] text-[#6b5f58] opacity-55 dark:text-[#9b9a92] max-[640px]:text-left">
              Year
            </label>
            <select
              value={year}
              onChange={(e) => onYearChange(Number(e.target.value))}
              aria-label="Select learning activity year"
              className="appearance-none rounded-[9px] border-[1.5px] border-[#e0d0c5] bg-white px-2.5 py-2 pr-7 font-['DM_Sans',sans-serif] text-[12.5px] font-semibold text-[#1a1714] outline-none transition focus:border-[#b84c2b] focus:shadow-[0_0_0_3px_rgba(184,76,43,0.18)] dark:border-white/9 dark:bg-[#252320] dark:text-[#f2f0eb] dark:focus:border-[#e8816a]"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
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
          style={{ gridTemplateColumns: '34px auto', gridTemplateRows: '18px auto' }}
          role="img"
          aria-label={`Learning activity calendar heatmap for ${year}`}
        >
          {/* Month labels row */}
          <div style={{ gridColumn: 2, gridRow: 1 }} className="relative h-4.5 min-w-fit">
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

          {/* Day labels column */}
          <div style={{ gridColumn: 1, gridRow: 2 }} className="grid grid-rows-7 gap-0.75" aria-hidden="true">
            {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((weekday, i) => (
              <span
                key={`${weekday}-${i}`}
                className="h-2.75 font-['DM_Mono',monospace] text-[7px] uppercase leading-2.75 tracking-[0.08em] text-[#6b5f58] opacity-60 dark:text-[#9b9a92]"
              >
                {weekday}
              </span>
            ))}
          </div>

          {/* Grid cells */}
          <div style={{ gridColumn: 2, gridRow: 2 }} className="flex min-w-fit gap-0.75">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.75">
                {week.map((cell, di) => (
                  <div
                    key={`${wi}-${di}`}
                    className={cn(
                      'h-2.75 w-2.75 shrink-0 cursor-default rounded-xs transition-all duration-150 hover:scale-[1.12] hover:opacity-85',
                      cell.inside
                        ? intensityClass[cell.intensityLevel]
                        : 'pointer-events-none opacity-0',
                    )}
                    title={
                      cell.inside
                        ? `${cell.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })} · ${cell.activityCount} activit${cell.activityCount === 1 ? 'y' : 'ies'}${cell.isFrozen ? ' · Streak freeze used' : ''}`
                        : ''
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-2.5 flex flex-wrap items-center justify-end gap-1.5">
        <span className="font-['DM_Mono',monospace] text-[8px] text-[#6b5f58] opacity-50 dark:text-[#9b9a92]">Less active</span>
        {(['none', 'low', 'medium', 'high'] as HeatmapIntensity[]).map((level) => (
          <div key={level} className={cn('h-2.75 w-2.75 rounded-xs', intensityClass[level])} />
        ))}
        <span className="font-['DM_Mono',monospace] text-[8px] text-[#6b5f58] opacity-50 dark:text-[#9b9a92]">More active</span>
      </div>

      {isLoading && (
        <div className="mt-3 text-[12px] font-medium text-[#6b5f58] dark:text-[#9b9a92]">
          Loading learning activity…
        </div>
      )}
    </section>
  )
}

// ── Sidebar card shell ────────────────────────────────────────────────────

const SidebarCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('rounded-2xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 dark:border-white/9 dark:bg-[#1e1c19]', className)}>
    {children}
  </div>
)

const SidebarCardHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div className="flex items-center gap-2 mb-4">
    {icon}
    <span className="font-['Playfair_Display',serif] text-[14.5px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">{title}</span>
  </div>
)

// ── Weekly bar chart ──────────────────────────────────────────────────────

const WEEK_STATS: WeekStat[] = [
  { label: 'Mon', xp: 320,  sessions: 2 },
  { label: 'Tue', xp: 180,  sessions: 1 },
  { label: 'Wed', xp: 540,  sessions: 3 },
  { label: 'Thu', xp: 0,    sessions: 0 },
  { label: 'Fri', xp: 420,  sessions: 2 },
  { label: 'Sat', xp: 680,  sessions: 4 },
  { label: 'Sun', xp: 200,  sessions: 1 },
]

const WeeklyChart = () => {
  const max       = Math.max(...WEEK_STATS.map((w) => w.xp), 1)
  const today     = new Date().getDay()
  const todayIdx  = today === 0 ? 6 : today - 1

  return (
    <SidebarCard>
      <SidebarCardHeader
        icon={<span className="text-[#b84c2b] dark:text-[#e8816a]"><Icon.Activity size={14} /></span>}
        title="This week"
      />
      <div className="flex items-end gap-1.25 h-20 mb-2">
        {WEEK_STATS.map((w, i) => {
          const pct     = Math.round((w.xp / max) * 100)
          const isToday = i === todayIdx
          return (
            <div key={w.label} className="flex-1 flex flex-col items-center h-full justify-end">
              <div
                className="w-full rounded-t-sm transition-all duration-500"
                style={{
                  height:    `${pct}%`,
                  minHeight: w.xp > 0 ? 4 : 0,
                  background: isToday ? '#b84c2b' : w.xp > 0 ? 'rgba(184,76,43,0.28)' : 'rgba(26,23,20,0.06)',
                }}
              />
            </div>
          )
        })}
      </div>
      <div className="flex gap-1.25">
        {WEEK_STATS.map((w, i) => {
          const isToday = i === todayIdx
          return (
            <div key={w.label} className="flex-1 text-center">
              <span className={cn("font-['DM_Mono',monospace] text-[8px] uppercase tracking-wide", isToday ? 'text-[#b84c2b] dark:text-[#e8816a] font-bold' : 'text-[#b0a097] dark:text-[#6b6460]')}>
                {w.label}
              </span>
            </div>
          )
        })}
      </div>
    </SidebarCard>
  )
}

// ── Activity event icon ───────────────────────────────────────────────────

const EventIconBubble = ({ type }: { type: ActivityEvent['icon'] }) => {
  const configs = {
    tracker:   { bg: 'bg-[rgba(184,76,43,0.1)] dark:bg-[rgba(232,129,106,0.12)]',  color: 'text-[#b84c2b] dark:text-[#e8816a]',  icon: <Icon.GraduationCap size={14} /> },
    test:      { bg: 'bg-[rgba(45,106,71,0.1)] dark:bg-[rgba(92,201,138,0.12)]',   color: 'text-[#2d6a47] dark:text-[#5cc98a]',   icon: <Icon.ClipboardCheck size={14} /> },
    community: { bg: 'bg-[rgba(124,90,30,0.1)] dark:bg-[rgba(196,154,44,0.12)]',   color: 'text-[#7c5a1e] dark:text-[#c49a2c]',   icon: <Icon.Users size={14} /> },
    fire:      { bg: 'bg-[rgba(184,76,43,0.1)] dark:bg-[rgba(232,129,106,0.12)]',  color: 'text-[#b84c2b] dark:text-[#e8816a]',   icon: <Icon.Fire size={14} /> },
    star:      { bg: 'bg-[rgba(196,154,44,0.1)] dark:bg-[rgba(196,154,44,0.12)]',  color: 'text-[#c49a2c]',                        icon: <Icon.Star size={13} /> },
  }
  const c = configs[type]
  return (
    <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', c.bg, c.color)}>
      {c.icon}
    </div>
  )
}

// ── Activity feed row ─────────────────────────────────────────────────────

const ActivityRow = ({ event }: { event: ActivityEvent }) => (
  <div className="flex items-start gap-3.5 px-5 py-3.25 border-b border-[#ece3db] last:border-b-0 dark:border-white/6 hover:bg-[rgba(26,23,20,0.012)] dark:hover:bg-white/[0.012] transition-colors duration-100">
    <EventIconBubble type={event.icon} />
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-[#2a2420] dark:text-[#dedad5] truncate">{event.title}</div>
          <div className="text-[11px] text-[#b0a097] dark:text-[#6b6460] mt-0.5">{event.subtitle}</div>
        </div>
        <div className="text-right shrink-0">
          {event.xp > 0 && (
            <span className="inline-flex items-center gap-1 font-['DM_Mono',monospace] text-[11px] font-bold text-[#b84c2b] dark:text-[#e8816a] tabular-nums">
              <Icon.Lightning size={10} />+{event.xp} XP
            </span>
          )}
          <div className="font-['DM_Mono',monospace] text-[9.5px] text-[#c4b8b0] dark:text-[#5a5550] mt-0.5 text-right">
            {event.timestamp}
          </div>
        </div>
      </div>
    </div>
  </div>
)

// ── Date divider ──────────────────────────────────────────────────────────

const DateDivider = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3 px-5 py-2.5 border-b border-[#e8ddd6] dark:border-white/8 bg-[rgba(26,23,20,0.018)] dark:bg-white/[0.018]">
    <span className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.14em] text-[#b0a097] dark:text-[#6b6460] select-none whitespace-nowrap">
      {label}
    </span>
    <div className="flex-1 h-px bg-[#e8ddd6] dark:bg-white/8" />
  </div>
)

// ── Sidebar row ───────────────────────────────────────────────────────────

const BestDayRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between py-2.25 border-b border-[#ece3db] last:border-b-0 dark:border-white/[0.07]">
    <span className="text-[12px] text-[#6b5f58] dark:text-[#9b9a92]">{label}</span>
    <span className="font-['DM_Mono',monospace] text-[12px] font-bold text-[#1a1714] dark:text-[#f2f0eb] tabular-nums">{value}</span>
  </div>
)

// ── Mock data ─────────────────────────────────────────────────────────────

// Generate realistic heatmap data for the HeapTile
function generateMockHeatmap(): HeatmapItem[] {
  const items: HeatmapItem[] = []
  const now   = new Date()
  const start = new Date(now)
  start.setDate(start.getDate() - 364)

  for (let i = 0; i < 365; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const recencyBoost = i > 330 ? 0.6 : i > 280 ? 0.38 : 0.16
    if (Math.random() < recencyBoost) {
      const count = Math.ceil(Math.random() * 5)
      const level: HeatmapIntensity = count >= 4 ? 'high' : count >= 3 ? 'medium' : count >= 2 ? 'low' : 'none'
      items.push({ date: toDateKey(d), intensityLevel: level, activityCount: count })
    }
  }
  return items
}

const MOCK_STREAK: StreakSummary = {
  currentStreak: 14,
  longestStreak: 32,
  heatmap:       generateMockHeatmap(),
}

const ACTIVITY_EVENTS: { date: string; label: string; events: ActivityEvent[] }[] = [
  {
    date: 'today', label: 'Today',
    events: [
      { id: '1', type: 'tracker',   icon: 'tracker', title: 'Completed subtopic: Recursion Basics',          subtitle: 'MERN Stack Zero-to-Hero Interview Roadmap',           xp: 20,  timestamp: '2h ago',                date: 'today' },
      { id: '2', type: 'mock_test', icon: 'test',    title: 'Attempted: Maths Mock Test',                    subtitle: 'Intermediate · 10 questions · Score: 60%',           xp: 45,  timestamp: '4h ago',                date: 'today' },
    ],
  },
  {
    date: 'yesterday', label: 'Yesterday',
    events: [
      { id: '3', type: 'community', icon: 'community', title: 'Verified tracker: Linear Algebra Deep-Dive',  subtitle: 'Peer review · 3 upvotes received',                   xp: 50,  timestamp: 'Yesterday, 8:30 PM',   date: 'yesterday' },
      { id: '4', type: 'tracker',   icon: 'tracker',   title: 'Completed subtopic: Async/Await Patterns',    subtitle: 'MERN Stack Zero-to-Hero Interview Roadmap',           xp: 20,  timestamp: 'Yesterday, 3:15 PM',   date: 'yesterday' },
      { id: '5', type: 'streak',    icon: 'fire',      title: '14-day streak milestone',                     subtitle: "Keep it going! You're on fire 🔥",                  xp: 100, timestamp: 'Yesterday, 12:00 AM',  date: 'yesterday' },
    ],
  },
  {
    date: '2026-06-11', label: 'Jun 11',
    events: [
      { id: '6', type: 'mock_test', icon: 'test',      title: 'Retook: Intermediate Mathematics Challenge',  subtitle: 'Intermediate · 10 questions · Score: 40%',           xp: 25,  timestamp: '2 days ago',            date: '2026-06-11' },
      { id: '7', type: 'community', icon: 'community', title: 'Cloned tracker: Modern Physics I',            subtitle: 'Added to your dashboard',                            xp: 0,   timestamp: '2 days ago',            date: '2026-06-11' },
    ],
  },
  {
    date: '2026-06-09', label: 'Jun 9',
    events: [
      { id: '8', type: 'xp_milestone', icon: 'star', title: 'XP milestone: 8,500 XP reached',               subtitle: 'Rank climbed from #140 → #128',                      xp: 0,   timestamp: '4 days ago',            date: '2026-06-09' },
      { id: '9', type: 'mock_test',    icon: 'test', title: 'Generated: Maths Mock Test',                    subtitle: '10 questions · 30 min · AI-generated',               xp: 0,   timestamp: '4 days ago',            date: '2026-06-09' },
    ],
  },
]

const FILTERS: ActivityFilter[] = ['All', 'Trackers', 'Mock Tests', 'Community']

const FILTER_ICON: Record<ActivityFilter, React.ReactNode> = {
  All:            <Icon.Activity size={12} />,
  Trackers:       <Icon.GraduationCap size={12} />,
  'Mock Tests':   <Icon.ClipboardCheck size={12} />,
  Community:      <Icon.Users size={12} />,
}

function filterEvents(groups: typeof ACTIVITY_EVENTS, filter: ActivityFilter) {
  if (filter === 'All') return groups
  const typeMap: Record<ActivityFilter, ActivityEvent['type'][]> = {
    All:            [],
    Trackers:       ['tracker'],
    'Mock Tests':   ['mock_test'],
    Community:      ['community'],
  }
  const types = typeMap[filter]
  return groups
    .map((g) => ({ ...g, events: g.events.filter((e) => types.includes(e.type)) }))
    .filter((g) => g.events.length > 0)
}

// ── Main page ─────────────────────────────────────────────────────────────

export default function ActivityPage() {
  const [sidebarOpen,      setSidebarOpen]      = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem('imminiq_sb') === 'closed',
  )
  const [activeFilter, setActiveFilter] = useState<ActivityFilter>('All')
  const [heatmapYear,  setHeatmapYear]  = useState(new Date().getFullYear())

  const dashboardSummaryQuery = {
    data: {
      user:   { fullName: 'Arjun Reddy', avatarUrl: null, isPremium: false },
      streak: { current: 14 },
    } as DashboardSummaryData,
    isLoading: false,
    isError:   false,
  }

  const dashboardSummary = dashboardSummaryQuery.data
  const isInitialLoad    = dashboardSummaryQuery.isLoading && !dashboardSummary
  const hasError         = dashboardSummaryQuery.isError

  const sidebarProps = {
    mobileOpen:        sidebarOpen,
    collapsed:         sidebarCollapsed,
    onCloseMobile:     () => setSidebarOpen(false),
    onToggleCollapsed: () =>
      setSidebarCollapsed((v) => {
        const next = !v
        localStorage.setItem('imminiq_sb', next ? 'closed' : 'open')
        return next
      }),
  }

  if (isInitialLoad) {
    return (
      <PageSkeleton
        sidebarOpen={sidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarOpen={setSidebarOpen}
        setSidebarCollapsed={setSidebarCollapsed}
      />
    )
  }

  if (hasError || !dashboardSummary) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5ede4] px-4 dark:bg-[#141412]">
        <div className="max-w-md rounded-2xl border border-[rgba(200,50,50,0.2)] bg-[#fdf8f5] p-8 text-center dark:bg-[#1e1c19]">
          <h1 className="font-['Playfair_Display',serif] text-[22px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
            Activity unavailable
          </h1>
          <p className="mt-2 text-[13px] leading-[1.6] text-[#6b5f58] dark:text-[#9b9a92]">
            Something went wrong loading your activity. Try refreshing the page.
          </p>
        </div>
      </div>
    )
  }

  const userInitials   = getInitials(dashboardSummary.user.fullName)
  const filteredGroups = filterEvents(ACTIVITY_EVENTS, activeFilter)

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#f5ede4] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]">
      <NoiseOverlay />

      <div className="relative z-1 flex min-h-screen w-full overflow-x-clip">
        <Sidebar {...sidebarProps} />

        <main className={cn(
          'flex min-w-0 flex-1 flex-col overflow-x-clip transition-[margin] duration-300',
          sidebarCollapsed ? 'min-[901px]:ml-0' : 'min-[901px]:ml-56',
        )}>
          <TopBar
            onMenuClick={() => setSidebarOpen(true)}
            streakDays={dashboardSummary.streak.current}
            userName={dashboardSummary.user.fullName}
            userInitials={userInitials}
            userAvatarUrl={dashboardSummary.user.avatarUrl ?? undefined}
            userLevel={formatLevelLabel(dashboardSummary.user.isPremium)}
            isGuest={false}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="mx-auto mt-6 flex w-[min(1180px,calc(100%-48px))] max-w-full min-w-0 flex-col gap-7 pb-[calc(80px+env(safe-area-inset-bottom,0)+24px)] max-[900px]:mt-5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[640px]:mt-4 max-[640px]:w-[calc(100%-20px)]">

              {/* ── Page header ── */}
              <section className="flex flex-wrap items-start justify-between gap-5">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[rgba(184,76,43,0.15)] bg-[rgba(184,76,43,0.07)] px-3 py-1.25">
                    <Icon.LiveDot />
                    <span className="font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.13em] text-[#b84c2b] dark:text-[#e8816a]">
                      Personal
                    </span>
                  </div>
                  <h1 className="font-['Playfair_Display',serif] text-[clamp(28px,3.5vw,40px)] font-black leading-[1.08] tracking-[-0.5px] text-[#1a1714] dark:text-[#f2f0eb]">
                    Your{' '}
                    <span className="text-[#b84c2b] dark:text-[#e8816a]">Activity</span>
                  </h1>
                  <p className="mt-2.5 max-w-105 text-[13px] italic leading-[1.6] text-[#7a6e66] dark:text-[#9b9a92]">
                    Track sessions, XP earned, streaks, and your learning rhythm over time.
                  </p>
                </div>

                {/* Streak badge — matches leaderboard #128 card style */}
                <div className="flex items-stretch gap-0 rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] overflow-hidden dark:border-white/9 dark:bg-[#1e1c19] max-[560px]:w-full">
                  <div className="px-5 py-4 flex flex-col justify-center">
                    <div className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.14em] text-[#b0a097] dark:text-[#6b6460] mb-1">
                      Current streak
                    </div>
                    <span className="font-['Playfair_Display',serif] text-[40px] font-black leading-none text-[#b84c2b] dark:text-[#e8816a] tabular-nums">
                      {dashboardSummary.streak.current}d
                    </span>
                  </div>
                  <div className="w-px bg-[#e0d0c5] dark:bg-white/9 self-stretch" />
                  <div className="px-4 flex flex-col items-center justify-center gap-1">
                    <span className="text-[#b84c2b] dark:text-[#e8816a]"><Icon.Fire size={22} /></span>
                    <div className="font-['DM_Mono',monospace] text-[8px] text-[#b0a097] dark:text-[#6b6460] uppercase tracking-wider">
                      keep it up
                    </div>
                  </div>
                </div>
              </section>

              {/* ── Stat cards (DashboardStatsGrid design) ── */}
              <ActivityStatsGrid
                totalXp={8920}
                sessions={47}
                subtopicsDone={50}
                testsAttempted={17}
                totalQuestions={150}
              />

              {/* ── HeapTile (real component) ── */}
              <HeapTile
                streak={MOCK_STREAK}
                year={heatmapYear}
                onYearChange={setHeatmapYear}
                accountCreatedAt="2024-01-01"
              />

              {/* ── Main feed + sidebar ── */}
              <div className="flex gap-5 items-start max-[860px]:flex-col">

                {/* Feed */}
                <div className="flex-1 min-w-0 flex flex-col gap-4">

                  {/* Filter tabs */}
                  <div
                    className="flex bg-[#fdf8f5] border-[1.5px] border-[#e0d0c5] rounded-xl p-0.75 gap-0.5 dark:bg-[#1e1c19] dark:border-white/9 w-fit flex-wrap"
                    role="group"
                    aria-label="Activity filter"
                  >
                    {FILTERS.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setActiveFilter(f)}
                        className={cn(
                          "flex items-center gap-1.5 px-3.5 py-1.5 rounded-[9px] border-none cursor-pointer font-['DM_Mono',monospace] text-[11px] font-bold uppercase tracking-[0.06em] transition-all select-none",
                          activeFilter === f
                            ? 'bg-[#b84c2b] text-white dark:bg-[#e8816a] dark:text-[#141412]'
                            : 'bg-transparent text-[#8a7d75] dark:text-[#6b6460]',
                        )}
                      >
                        {FILTER_ICON[f]}
                        {f}
                      </button>
                    ))}
                  </div>

                  {/* Feed card */}
                  <div className="rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] overflow-hidden dark:border-white/9 dark:bg-[#1e1c19]">
                    {filteredGroups.length === 0 ? (
                      <div className="py-16 text-center text-[13px] text-[#b0a097] dark:text-[#6b6460]">
                        No activity found for this filter.
                      </div>
                    ) : (
                      filteredGroups.map((group) => (
                        <div key={group.date}>
                          <DateDivider label={group.label} />
                          {group.events.map((event) => (
                            <ActivityRow key={event.id} event={event} />
                          ))}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Sidebar */}
                <aside className="w-62 shrink-0 flex flex-col gap-3 max-[860px]:w-full">

                  <WeeklyChart />

                  <SidebarCard>
                    <SidebarCardHeader
                      icon={<span className="text-[#b84c2b] dark:text-[#e8816a]"><Icon.Sparkles size={14} /></span>}
                      title="XP this week"
                    />
                    <div className="flex items-end gap-2 mb-3">
                      <span className="font-['Playfair_Display',serif] text-[32px] font-black leading-none text-[#1a1714] dark:text-[#f2f0eb] tabular-nums">
                        1,240
                      </span>
                      <span className="mb-1 inline-flex items-center gap-1 font-['DM_Mono',monospace] text-[10px] font-bold text-[#2d6a47] dark:text-[#5cc98a]">
                        <Icon.TrendUp size={10} /> 12%
                      </span>
                    </div>
                    <div className="h-0.75 rounded-full bg-[rgba(26,23,20,0.07)] dark:bg-white/8 mb-3 overflow-hidden">
                      <div className="h-full rounded-full bg-[#b84c2b] dark:bg-[#e8816a]" style={{ width: '25%' }} />
                    </div>
                    <div className="text-[10.5px] text-[#b0a097] dark:text-[#6b6460] mb-4">3,760 XP to next tier</div>
                    <BestDayRow label="Tracker XP"  value="640 XP" />
                    <BestDayRow label="Test XP"     value="445 XP" />
                    <BestDayRow label="Community XP" value="155 XP" />
                  </SidebarCard>

                  <SidebarCard>
                    <SidebarCardHeader
                      icon={<span className="text-[#c49a2c]"><Icon.Trophy size={14} /></span>}
                      title="Personal bests"
                    />
                    <BestDayRow label="Best day XP"    value="680 XP" />
                    <BestDayRow label="Longest streak"  value="32 days" />
                    <BestDayRow label="Sessions / week" value="13"      />
                    <BestDayRow label="Best test score"  value="60%"    />
                  </SidebarCard>

                  {/* Promo card */}
                  <div className="rounded-2xl p-5" style={{ background: '#b84c2b' }}>
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="text-[rgba(255,255,255,0.75)]"><Icon.Star size={13} /></span>
                      <span className="font-['Playfair_Display',serif] text-[14.5px] font-extrabold text-white">Daily Goal</span>
                    </div>
                    <p className="text-[11.5px] text-[rgba(255,255,255,0.8)] leading-[1.6] mb-4">
                      Complete 1 subtopic and take a mock test today to earn your daily bonus of 50 XP.
                    </p>
                    <div className="h-1 rounded-full bg-white/20 mb-3 overflow-hidden">
                      <div className="h-full rounded-full bg-white" style={{ width: '50%' }} />
                    </div>
                    <div className="font-['DM_Mono',monospace] text-[10px] text-white/70 uppercase tracking-wider">
                      1 / 2 tasks done
                    </div>
                  </div>

                </aside>
              </div>

            </div>
            <AppFooter />
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  )
}