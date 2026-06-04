import { useState, type Dispatch, type SetStateAction } from 'react'
import { useNavigate } from 'react-router-dom'

import Sidebar from '../../../components/layout/Sidebar'
import TopBar from '../../../components/layout/TopBar'
import AppFooter from '../../../components/layout/Footer'
import BottomNav from '../../../components/layout/BottomNav'

// ── Helpers ───────────────────────────────────────────────────────────────

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const formatLevelLabel = (isPremium: boolean) =>
  isPremium ? 'Imminiq Pro' : 'Free Scholar'

// ── Types ─────────────────────────────────────────────────────────────────

type LeaderboardScope = 'Global' | 'Friends' | 'Weekly'
type LeaderboardSection = 'students' | 'trainers'

interface LeaderEntry {
  rank: number
  name: string
  handle: string
  track: string
  xp: number
  streak: number
  trend: number
  avatarColor: string
  initials: string
  isMe?: boolean
}

interface TopThreeEntry {
  rank: 1 | 2 | 3
  name: string
  xp: number
  streak: number
  streakDays: number
  avatarColor: string
  initials: string
  isChampion?: boolean
}

interface StreakChampion {
  initials: string
  name: string
  streak: number
  avatarColor: string
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

// ── Icons ─────────────────────────────────────────────────────────────────

const FireIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 2C12 2 7 7 7 12.5C7 15.538 9.239 18 12 18C14.761 18 17 15.538 17 12.5C17 11 16.5 9.5 15.5 8.5C15.5 8.5 15 11 13 11C13 11 14 8 12 2Z" fill="currentColor" />
    <path d="M12 18C10.343 18 9 19.343 9 21H15C15 19.343 13.657 18 12 18Z" fill="currentColor" opacity="0.5" />
  </svg>
)

const TrendUpIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3 17l5-5 4 4 7-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 8h5v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const TrendDownIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3 7l5 5 4-4 7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 16h5v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const TrendFlatIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" />
    <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const SparklesIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z" fill="currentColor" />
    <path d="M5 15L5.74 18.26L9 19L5.74 19.74L5 23L4.26 19.74L1 19L4.26 18.26L5 15Z" fill="currentColor" opacity="0.6" />
    <path d="M19 2L19.5 4.5L22 5L19.5 5.5L19 8L18.5 5.5L16 5L18.5 4.5L19 2Z" fill="currentColor" opacity="0.6" />
  </svg>
)

const TrophyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 9H4a2 2 0 01-2-2V5h4M18 9h2a2 2 0 002-2V5h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M6 5h12v5a6 6 0 01-12 0V5z" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 16v4M8 20h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const StarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
  </svg>
)

// ── Noise overlay ─────────────────────────────────────────────────────────

const NoiseOverlay = () => (
  <div
    className="pointer-events-none fixed inset-0 z-0 opacity-[0.025] dark:opacity-[0.04]"
    style={{
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
      backgroundSize: '180px',
    }}
  />
)

// ── Skeleton ──────────────────────────────────────────────────────────────

const SkeletonBlock = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse rounded-full bg-[#e8ddd6] dark:bg-white/10', className)} />
)

const RowSkeleton = () => (
  <div className="animate-pulse flex items-center gap-4 px-4 py-3.5 border-b border-[#e8ddd6] dark:border-white/8 last:border-b-0">
    <div className="w-8 h-3 rounded bg-[#e8ddd6] dark:bg-white/10 flex-shrink-0" />
    <div className="h-9 w-9 rounded-full bg-[#e8ddd6] dark:bg-white/10 flex-shrink-0" />
    <div className="flex-1 space-y-1.5 min-w-0">
      <div className="h-3.5 w-1/3 rounded bg-[#e8ddd6] dark:bg-white/10" />
      <div className="h-3 w-1/4 rounded bg-[#e8ddd6] dark:bg-white/10" />
    </div>
    <div className="h-3 w-12 rounded bg-[#e8ddd6] dark:bg-white/10" />
    <div className="h-3 w-8 rounded bg-[#e8ddd6] dark:bg-white/10" />
  </div>
)

const PageSkeleton = ({
  sidebarOpen,
  sidebarCollapsed,
  setSidebarOpen,
  setSidebarCollapsed,
}: {
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  setSidebarOpen: (v: boolean) => void
  setSidebarCollapsed: Dispatch<SetStateAction<boolean>>
}) => (
  <div
    className="relative min-h-screen overflow-x-clip bg-[#f5ede4] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]"
    role="status"
    aria-live="polite"
    aria-label="Loading leaderboard"
  >
    <NoiseOverlay />
    <div className="relative z-1 flex min-h-screen w-full overflow-x-clip">
      <Sidebar
        mobileOpen={sidebarOpen}
        collapsed={sidebarCollapsed}
        onCloseMobile={() => setSidebarOpen(false)}
        onToggleCollapsed={() =>
          setSidebarCollapsed((v) => {
            const next = !v
            localStorage.setItem('imminiq_sb', next ? 'closed' : 'open')
            return next
          })
        }
      />
      <main className={cn('flex min-w-0 flex-1 flex-col overflow-x-clip transition-[margin] duration-300', sidebarCollapsed ? 'min-[901px]:ml-0' : 'min-[901px]:ml-56')}>
        <TopBar onMenuClick={() => setSidebarOpen(true)} streakDays={0} userName="Loading" userInitials="IM" userLevel="Loading" isGuest={false} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mx-auto mt-5.5 flex w-[min(1180px,calc(100%-48px))] max-w-full min-w-0 flex-col gap-6 pb-[calc(80px+env(safe-area-inset-bottom,0)+16px)] max-[900px]:mt-4.5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[640px]:mt-3 max-[640px]:w-[calc(100%-20px)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3 flex-1 min-w-0">
                <SkeletonBlock className="h-4 w-16 rounded-full" />
                <SkeletonBlock className="h-10 w-72 rounded-2xl" />
                <SkeletonBlock className="h-4 w-96" />
              </div>
              <SkeletonBlock className="h-16 w-52 rounded-[16px]" />
            </div>
            <div className="rounded-[20px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] dark:border-white/9 dark:bg-[#1e1c19]">
              {Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} />)}
            </div>
          </div>
          <AppFooter />
        </div>
      </main>
    </div>
    <BottomNav />
  </div>
)

// ── Avatar ────────────────────────────────────────────────────────────────

const Avatar = ({
  initials,
  color,
  size = 'md',
}: {
  initials: string
  color: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}) => {
  const sizes = { sm: 'h-7 w-7 text-[10px]', md: 'h-9 w-9 text-[12px]', lg: 'h-14 w-14 text-[16px]', xl: 'h-20 w-20 text-[22px]' }
  return (
    <div
      className={cn('flex flex-shrink-0 items-center justify-center rounded-full font-bold text-white', sizes[size])}
      style={{ background: color }}
    >
      {initials}
    </div>
  )
}

// ── Trend badge ───────────────────────────────────────────────────────────

const TrendBadge = ({ trend }: { trend: number }) => {
  if (trend > 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-[#2d6a47] dark:text-[#5cc98a] font-['DM_Mono',monospace] text-[11px] font-bold">
        <TrendUpIcon /> {trend}
      </span>
    )
  if (trend < 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-[#b84c2b] dark:text-[#e8816a] font-['DM_Mono',monospace] text-[11px] font-bold">
        <TrendDownIcon /> {Math.abs(trend)}
      </span>
    )
  return (
    <span className="inline-flex items-center gap-0.5 text-[#9b9a92] font-['DM_Mono',monospace] text-[11px]">
      <TrendFlatIcon /> 0
    </span>
  )
}

// ── Track badge ───────────────────────────────────────────────────────────

const TRACK_COLORS: Record<string, string> = {
  Logic:      'bg-[rgba(184,76,43,0.08)] text-[#b84c2b] border-[rgba(184,76,43,0.18)] dark:text-[#e8816a]',
  History:    'bg-[rgba(45,106,71,0.08)] text-[#2d6a47] border-[rgba(45,106,71,0.18)] dark:text-[#5cc98a]',
  Astrology:  'bg-[rgba(124,90,30,0.08)] text-[#7c5a1e] border-[rgba(124,90,30,0.2)] dark:text-[#c49a2c]',
  CompSci:    'bg-[rgba(184,76,43,0.08)] text-[#b84c2b] border-[rgba(184,76,43,0.18)] dark:text-[#e8816a]',
  Economics:  'bg-[rgba(45,106,71,0.08)] text-[#2d6a47] border-[rgba(45,106,71,0.18)] dark:text-[#5cc98a]',
  Physics:    'bg-[rgba(124,90,30,0.08)] text-[#7c5a1e] border-[rgba(124,90,30,0.2)] dark:text-[#c49a2c]',
  Biology:    'bg-[rgba(45,106,71,0.08)] text-[#2d6a47] border-[rgba(45,106,71,0.18)] dark:text-[#5cc98a]',
  Design:     'bg-[rgba(184,76,43,0.08)] text-[#b84c2b] border-[rgba(184,76,43,0.18)] dark:text-[#e8816a]',
}

const TrackBadge = ({ track }: { track: string }) => (
  <span className={cn(
    "font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.1em] px-[7px] py-[2px] rounded-full border",
    TRACK_COLORS[track] ?? 'bg-[rgba(26,23,20,0.05)] text-[#9b9a92] border-[#e0d0c5] dark:border-white/9',
  )}>
    {track}
  </span>
)

// ── Rank medal ────────────────────────────────────────────────────────────

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

// ── Top-3 podium card ─────────────────────────────────────────────────────

const PodiumCard = ({ entry, section }: { entry: TopThreeEntry; section: LeaderboardSection }) => {
  const isFirst = entry.rank === 1
  const sectionColor = section === 'students' ? '#b84c2b' : '#2d6a47'

  return (
    <div className={cn(
      'flex flex-col items-center rounded-[20px] border-[1.5px] bg-[#fdf8f5] p-5 pb-5 relative transition dark:bg-[#1e1c19]',
      isFirst
        ? 'border-[rgba(184,76,43,0.25)] shadow-[0_4px_24px_rgba(184,76,43,0.10)] dark:border-[rgba(232,129,106,0.22)]'
        : 'border-[#e0d0c5] dark:border-white/9',
      isFirst ? 'z-10 scale-[1.03]' : '',
    )}>
      {isFirst && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(184,76,43,0.22)] bg-[#b84c2b] px-3 py-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.12em] text-white dark:bg-[#e8816a] dark:text-[#141412]">
            {section === 'students' ? '🏆 Champion' : '⭐ Top Trainer'}
          </span>
        </div>
      )}

      <div className="relative mb-3 mt-1">
        <Avatar initials={entry.initials} color={entry.avatarColor} size={isFirst ? 'xl' : 'lg'} />
        <span className="absolute -bottom-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#fdf8f5] bg-[#f5ede4] text-[10px] dark:border-[#1e1c19] dark:bg-[#141412]">
          {MEDAL[entry.rank]}
        </span>
      </div>

      <h3 className={cn(
        "font-['Playfair_Display',serif] font-[900] leading-[1.15] text-center text-[#1a1714] dark:text-[#f2f0eb]",
        isFirst ? 'text-[22px]' : 'text-[16px]',
      )}>
        {entry.name}
      </h3>

      <span className="mt-1 font-['DM_Mono',monospace] text-[12px] font-bold" style={{ color: sectionColor }}>
        {entry.xp.toLocaleString()} XP
      </span>

      {isFirst && (
        <div className="mt-2.5 flex items-center gap-1.5 rounded-full border border-[rgba(184,76,43,0.22)] bg-[rgba(184,76,43,0.08)] px-3 py-1.5 font-['DM_Mono',monospace] text-[10px] font-bold text-[#b84c2b] dark:text-[#e8816a]">
          <FireIcon size={12} /> {entry.streakDays}-DAY STREAK
        </div>
      )}

      {!isFirst && (
        <span className="mt-1.5 flex items-center gap-1 text-[11px] text-[#9b9a92]">
          <FireIcon size={11} /> {entry.streakDays} days
        </span>
      )}
    </div>
  )
}

// ── Leaderboard table row ─────────────────────────────────────────────────

const LeaderRow = ({ entry }: { entry: LeaderEntry }) => (
  <div className={cn(
    'flex items-center gap-4 px-4 py-3 border-b border-[#e8ddd6] last:border-b-0 transition dark:border-white/8',
    entry.isMe
      ? 'bg-[rgba(184,76,43,0.04)] dark:bg-[rgba(232,129,106,0.05)]'
      : 'hover:bg-[rgba(26,23,20,0.02)] dark:hover:bg-white/[0.02]',
  )}>
    <span className={cn(
      "font-['DM_Mono',monospace] text-[13px] font-bold w-9 flex-shrink-0 text-center",
      entry.isMe ? 'text-[#b84c2b] dark:text-[#e8816a]' : 'text-[#9b9a92]',
    )}>
      #{entry.rank}
    </span>

    <Avatar initials={entry.initials} color={entry.avatarColor} size="md" />

    <div className="flex-1 min-w-0">
      <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
        <span className="font-bold text-[13.5px] text-[#1a1714] dark:text-[#f2f0eb] truncate">
          {entry.name}{entry.isMe ? ' (You)' : ''}
        </span>
        <TrackBadge track={entry.track} />
      </div>
      <span className="text-[11px] text-[#9b9a92]">{entry.handle}</span>
    </div>

    <div className="text-right flex-shrink-0 hidden min-[480px]:block">
      <div className="font-['DM_Mono',monospace] text-[13px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
        {entry.xp.toLocaleString()}
      </div>
      <div className="text-[10px] text-[#9b9a92] uppercase tracking-wider">XP</div>
    </div>

    <div className="flex items-center gap-1 text-[11.5px] text-[#9b9a92] flex-shrink-0 w-14 justify-end hidden min-[560px]:flex">
      <FireIcon size={11} /> {entry.streak}d
    </div>

    <div className="flex-shrink-0 w-10 text-right">
      <TrendBadge trend={entry.trend} />
    </div>
  </div>
)

// ── My rank sticky bar ────────────────────────────────────────────────────

const MyRankBar = ({ entry }: { entry: LeaderEntry }) => (
  <div className="flex items-center gap-4 px-4 py-3.5 rounded-[14px] border-[1.5px] border-[rgba(184,76,43,0.22)] bg-[#fdf8f5] dark:border-[rgba(232,129,106,0.22)] dark:bg-[#1e1c19]">
    <span className="font-['Playfair_Display',serif] text-[22px] font-[900] text-[#b84c2b] dark:text-[#e8816a] w-16 flex-shrink-0">
      #{entry.rank}
    </span>
    <Avatar initials={entry.initials} color={entry.avatarColor} size="md" />
    <div className="flex-1 min-w-0">
      <div className="font-bold text-[13.5px] text-[#1a1714] dark:text-[#f2f0eb]">{entry.name} (You)</div>
      <div className="text-[11px] text-[#9b9a92]">320 XP to Top 100</div>
    </div>
    <div className="text-right flex-shrink-0">
      <div className="font-['DM_Mono',monospace] text-[13px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
        {entry.xp.toLocaleString()} XP
      </div>
      <div className="text-[10px] text-[#9b9a92]">Total score</div>
    </div>
    <div className="flex-shrink-0">
      <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(184,76,43,0.09)] border border-[rgba(184,76,43,0.18)] px-2.5 py-1 font-['DM_Mono',monospace] text-[10px] font-bold text-[#b84c2b] dark:text-[#e8816a]">
        <FireIcon size={10} /> {entry.trend > 0 ? `+${entry.trend}` : entry.trend}
      </span>
    </div>
  </div>
)

// ── Scoring compendium ────────────────────────────────────────────────────

const ScoringRow = ({ label, xp }: { label: string; xp: string }) => (
  <div className="flex items-center justify-between py-[7px] border-b border-[#e0d0c5] last:border-b-0 text-[12.5px] dark:border-white/9">
    <span className="text-[#6b5f58] dark:text-[#9b9a92]">{label}</span>
    <span className="font-['DM_Mono',monospace] font-bold text-[#b84c2b] dark:text-[#e8816a]">{xp}</span>
  </div>
)

// ── Mock data ─────────────────────────────────────────────────────────────

const STUDENT_TOP3: TopThreeEntry[] = [
  { rank: 1, name: 'Riya Sharma',   xp: 24890, streak: 1, streakDays: 32, avatarColor: '#b84c2b', initials: 'RS', isChampion: true },
  { rank: 2, name: 'Arjun Kumar',   xp: 22410, streak: 1, streakDays: 26, avatarColor: '#c49a2c', initials: 'AK' },
  { rank: 3, name: 'Meera Nair',    xp: 21760, streak: 1, streakDays: 21, avatarColor: '#2d6a47', initials: 'MN' },
]

const STUDENT_ROWS: LeaderEntry[] = [
  { rank: 4,   name: 'Siddharth V',    handle: '@sid_scribe',  track: 'Logic',    xp: 19840, streak: 18, trend:  2, avatarColor: '#5c4a3a', initials: 'SV' },
  { rank: 5,   name: 'Aisha Khan',     handle: '@aisha_k',     track: 'History',  xp: 18220, streak: 12, trend:  0, avatarColor: '#3a4a5c', initials: 'AK' },
  { rank: 6,   name: 'Dev Patel',      handle: '@patel_dev',   track: 'Astrology',xp: 17450, streak:  9, trend: -1, avatarColor: '#4a5c3a', initials: 'DP' },
  { rank: 7,   name: 'Priya Menon',    handle: '@priya_m',     track: 'CompSci',  xp: 16980, streak: 22, trend:  3, avatarColor: '#7c3a2d', initials: 'PM' },
  { rank: 8,   name: 'Kiran Rao',      handle: '@kiran_r',     track: 'Economics',xp: 15600, streak:  7, trend: -2, avatarColor: '#2d5c7c', initials: 'KR' },
  { rank: 128, name: 'Arjun Kumar',    handle: '@arjun_you',   track: 'Logic',    xp:  8920, streak: 14, trend: 12, avatarColor: '#b84c2b', initials: 'A', isMe: true },
]

const TRAINER_TOP3: TopThreeEntry[] = [
  { rank: 1, name: 'Dr. Elias Vance',   xp: 31200, streak: 1, streakDays: 45, avatarColor: '#2d6a47', initials: 'EV', isChampion: true },
  { rank: 2, name: 'Prof. Lena Wu',      xp: 28750, streak: 1, streakDays: 38, avatarColor: '#7c5a1e', initials: 'LW' },
  { rank: 3, name: 'Dr. Amos Osei',      xp: 26400, streak: 1, streakDays: 29, avatarColor: '#b84c2b', initials: 'AO' },
]

const TRAINER_ROWS: LeaderEntry[] = [
  { rank: 4, name: 'Prof. Sara Kim',    handle: '@sara_kim',    track: 'Physics',  xp: 23100, streak: 20, trend:  1, avatarColor: '#5c3a6b', initials: 'SK' },
  { rank: 5, name: 'Dr. Raj Nair',      handle: '@raj_nair',    track: 'Biology',  xp: 21800, streak: 15, trend: -1, avatarColor: '#3a5c4b', initials: 'RN' },
  { rank: 6, name: 'Prof. Mia Torres',  handle: '@mia_t',       track: 'Design',   xp: 20400, streak: 11, trend:  2, avatarColor: '#6b3a2d', initials: 'MT' },
  { rank: 7, name: 'Dr. Shen Li',       handle: '@shen_li',     track: 'CompSci',  xp: 19100, streak: 18, trend:  0, avatarColor: '#2d3a6b', initials: 'SL' },
  { rank: 8, name: 'Prof. Nina Patel',  handle: '@nina_p',      track: 'History',  xp: 17900, streak:  8, trend: -2, avatarColor: '#6b5a2d', initials: 'NP' },
]

const STUDENT_STREAK_CHAMPS: StreakChampion[] = [
  { initials: 'RS', name: 'Riya Sharma', streak: 142, avatarColor: '#b84c2b' },
  { initials: 'AK', name: 'Arjun Kumar', streak: 98,  avatarColor: '#c49a2c' },
  { initials: 'MN', name: 'Meera Nair',  streak: 84,  avatarColor: '#2d6a47' },
]

const TRAINER_STREAK_CHAMPS: StreakChampion[] = [
  { initials: 'EV', name: 'Dr. Elias Vance', streak: 187, avatarColor: '#2d6a47' },
  { initials: 'LW', name: 'Prof. Lena Wu',   streak: 121, avatarColor: '#7c5a1e' },
  { initials: 'AO', name: 'Dr. Amos Osei',   streak: 95,  avatarColor: '#b84c2b' },
]

const SCOPES: LeaderboardScope[] = ['Global', 'Friends', 'Weekly']
const TRACKS = ['All tracks', 'Logic', 'History', 'CompSci', 'Economics', 'Physics', 'Biology']
const TIME_FILTERS = ['This week', 'This month', 'All time']

// ── Section tab switcher ──────────────────────────────────────────────────

const SectionTabSwitcher = ({
  active,
  onChange,
}: {
  active: LeaderboardSection
  onChange: (s: LeaderboardSection) => void
}) => (
  <div
    className="relative flex items-center rounded-[14px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-1 gap-1 dark:border-white/9 dark:bg-[#1e1c19]"
    role="tablist"
    aria-label="Leaderboard section"
  >
    {/* Sliding indicator */}
    <div
      className="absolute top-1 bottom-1 rounded-[10px] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
      style={{
        background: active === 'students' ? '#b84c2b' : '#2d6a47',
        left: active === 'students' ? '4px' : 'calc(50%)',
        width: 'calc(50% - 4px)',
      }}
    />
    <button
      type="button"
      role="tab"
      aria-selected={active === 'students'}
      onClick={() => onChange('students')}
      className={cn(
        "relative z-10 flex flex-1 items-center justify-center gap-2 rounded-[10px] px-5 py-2.5 font-['DM_Mono',monospace] text-[12px] font-bold uppercase tracking-[0.08em] transition-colors duration-200",
        active === 'students' ? 'text-white' : 'text-[#6b5f58] dark:text-[#9b9a92]',
      )}
    >
      <span>🎓</span> Students
    </button>
    <button
      type="button"
      role="tab"
      aria-selected={active === 'trainers'}
      onClick={() => onChange('trainers')}
      className={cn(
        "relative z-10 flex flex-1 items-center justify-center gap-2 rounded-[10px] px-5 py-2.5 font-['DM_Mono',monospace] text-[12px] font-bold uppercase tracking-[0.08em] transition-colors duration-200",
        active === 'trainers' ? 'text-white' : 'text-[#6b5f58] dark:text-[#9b9a92]',
      )}
    >
      <span>🧑‍🏫</span> Trainers
    </button>
  </div>
)

// ── Leaderboard section component ────────────────────────────────────────

const LeaderboardSection = ({
  section,
  search,
  trackFilter,
}: {
  section: LeaderboardSection
  scope: LeaderboardScope
  search: string
  trackFilter: string
}) => {
  const navigate = useNavigate()

  const top3    = section === 'students' ? STUDENT_TOP3    : TRAINER_TOP3
  const rows    = section === 'students' ? STUDENT_ROWS    : TRAINER_ROWS
  const myEntry = section === 'students' ? STUDENT_ROWS.find((r) => r.isMe) : undefined
  const streakChamps = section === 'students' ? STUDENT_STREAK_CHAMPS : TRAINER_STREAK_CHAMPS

  const isStudents = section === 'students'
  const accentClass = isStudents ? 'text-[#b84c2b] dark:text-[#e8816a]' : 'text-[#2d6a47] dark:text-[#5cc98a]'
  const barColor    = isStudents ? '#b84c2b' : '#2d6a47'

  const filteredRows = rows.filter((r) => {
    const matchTrack  = trackFilter === 'All tracks' || r.track === trackFilter
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.handle.toLowerCase().includes(search.toLowerCase())
    return matchTrack && matchSearch
  })

  const myRank = myEntry?.rank ?? 128
  const weeklyXp = isStudents ? 1240 : 3180

  return (
    <div className="flex gap-5 items-start max-[860px]:flex-col">

      {/* ── Main column ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-5">

        {/* Podium — top 3 */}
        <div className="grid grid-cols-3 gap-3 items-end max-[540px]:grid-cols-1">
          {([top3[1], top3[0], top3[2]] as TopThreeEntry[]).map((entry) => (
            <PodiumCard key={entry.rank} entry={entry} section={section} />
          ))}
        </div>

        {/* Table */}
        <div className="rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] overflow-hidden dark:border-white/9 dark:bg-[#1e1c19]">
          {/* Table header */}
          <div className="flex items-center gap-4 px-4 py-2.5 border-b border-[#e8ddd6] dark:border-white/8 bg-[rgba(26,23,20,0.02)] dark:bg-white/[0.02]">
            <span className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.12em] text-[#9b9a92] w-9 text-center flex-shrink-0">Rank</span>
            <span className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.12em] text-[#9b9a92] flex-1">
              {isStudents ? 'Scholar' : 'Trainer'}
            </span>
            <span className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.12em] text-[#9b9a92] hidden min-[480px]:block w-16 text-right">Score</span>
            <span className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.12em] text-[#9b9a92] hidden min-[560px]:block w-14 text-right">Streak</span>
            <span className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.12em] text-[#9b9a92] w-10 text-right">Trend</span>
          </div>

          {/* Rows */}
          {filteredRows.filter((r) => !r.isMe).map((entry) => (
            <LeaderRow key={entry.rank} entry={entry} />
          ))}

          {filteredRows.length === 0 && (
            <div className="py-10 text-center text-[13px] text-[#9b9a92]">
              No scholars match your search.
            </div>
          )}
        </div>

        {/* My rank sticky bar (students only) */}
        {isStudents && myEntry && (
          <MyRankBar entry={myEntry} />
        )}
      </div>

      {/* ── Right sidebar ── */}
      <aside className="w-[248px] flex-shrink-0 flex flex-col gap-3.5 max-[860px]:w-full">

        {/* My current rank card */}
        <div className="rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 dark:border-white/9 dark:bg-[#1e1c19]">
          <div className="font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.12em] text-[#9b9a92] mb-2">
            {isStudents ? 'Your current rank' : 'Community rank'}
          </div>
          <div className="flex items-end gap-3 mb-3">
            <span className={cn("font-['Playfair_Display',serif] text-[40px] font-[900] leading-none", accentClass)}>
              #{myRank}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(45,106,71,0.2)] bg-[rgba(45,106,71,0.07)] px-2 py-0.5 font-['DM_Mono',monospace] text-[9px] font-bold text-[#2d6a47] mb-1.5 dark:text-[#5cc98a]">
              <TrendUpIcon /> {isStudents ? '12' : '5'}
            </span>
          </div>

          {/* Weekly XP progress */}
          <div className="font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.12em] text-[#9b9a92] mb-1.5">Weekly progress</div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-['Playfair_Display',serif] text-[22px] font-[900] text-[#1a1714] dark:text-[#f2f0eb] leading-none">
              {weeklyXp.toLocaleString()}
            </span>
            <span className="text-[11px] text-[#2d6a47] font-bold dark:text-[#5cc98a]">↑12%</span>
          </div>
          <div className="h-[5px] rounded-full bg-[rgba(26,23,20,0.08)] dark:bg-white/10 mb-1">
            <div className="h-full rounded-full transition-all" style={{ width: `${(weeklyXp / 5000) * 100}%`, background: barColor }} />
          </div>
          <div className="text-[10.5px] text-[#9b9a92]">{(5000 - weeklyXp).toLocaleString()} XP to next tier</div>
        </div>

        {/* Scoring compendium */}
        <div className="rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 dark:border-white/9 dark:bg-[#1e1c19]">
          <div className="flex items-center gap-1.5 mb-3.5">
            <span className={accentClass}><SparklesIcon /></span>
            <span className="font-['Playfair_Display',serif] text-[15px] font-[800] text-[#1a1714] dark:text-[#f2f0eb]">
              Scoring
            </span>
          </div>
          {isStudents ? (
            <>
              <ScoringRow label="Subtopic Mastery"   xp="+20 XP"  />
              <ScoringRow label="Mock Test (Perfect)" xp="+100 XP" />
              <ScoringRow label="Daily Inquiry"       xp="+15 XP"  />
              <ScoringRow label="Peer Review"         xp="+50 XP"  />
            </>
          ) : (
            <>
              <ScoringRow label="Tracker Published"   xp="+80 XP"  />
              <ScoringRow label="Tracker Verified"    xp="+50 XP"  />
              <ScoringRow label="Student Milestone"   xp="+30 XP"  />
              <ScoringRow label="Community Vote"      xp="+25 XP"  />
            </>
          )}
        </div>

        {/* Streak champions */}
        <div className="rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 dark:border-white/9 dark:bg-[#1e1c19]">
          <div className="flex items-center gap-1.5 mb-3.5">
            <span className="text-[#c49a2c]"><TrophyIcon /></span>
            <span className="font-['Playfair_Display',serif] text-[15px] font-[800] text-[#1a1714] dark:text-[#f2f0eb]">
              Streak Champions
            </span>
          </div>
          {streakChamps.map(({ initials, name, streak, avatarColor }) => (
            <div key={name} className="flex items-center gap-2.5 py-2 border-b border-[#e8ddd6] last:border-b-0 dark:border-white/8">
              <Avatar initials={initials} color={avatarColor} size="sm" />
              <span className="flex-1 text-[13px] text-[#1a1714] dark:text-[#f2f0eb] truncate">{name}</span>
              <span className="flex items-center gap-1 font-['DM_Mono',monospace] text-[11px] text-[#9b9a92]">
                <FireIcon size={11} /> {streak}
              </span>
            </div>
          ))}
        </div>

        {/* Elite distinction */}
        <div className="rounded-[18px] bg-[#b84c2b] dark:bg-[#963d22] p-5">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[rgba(255,255,255,0.7)]"><StarIcon /></span>
            <span className="font-['Playfair_Display',serif] text-[15px] font-[800] text-white">
              Elite Distinction
            </span>
          </div>
          <p className="text-[12px] text-[rgba(255,255,255,0.8)] leading-[1.55] mb-3.5">
            Reach the Top 100 this week to unlock the "Centurion Scholar" badge and 500 gold coins.
          </p>
          <button
            type="button"
            onClick={() => navigate('/leaderboard/rewards')}
            className="w-full rounded-[9px] border border-white/25 bg-white/15 py-2 text-[12px] font-bold text-white transition hover:bg-white/25"
          >
            View Rewards
          </button>
        </div>

      </aside>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────

export default function LeaderboardPage() {

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem('imminiq_sb') === 'closed',
  )

  const [activeSection, setActiveSection] = useState<LeaderboardSection>('students')
  const [scope, setScope] = useState<LeaderboardScope>('Global')
  const [trackFilter, setTrackFilter] = useState('All tracks')
  const [timeFilter, setTimeFilter] = useState('This week')
  const [search, setSearch] = useState('')

  // Replace with real hook:
  // const dashboardSummaryQuery = useDashboardSummary()
  const dashboardSummaryQuery = {
    data: { user: { fullName: 'Arjun Reddy', avatarUrl: null, isPremium: false }, streak: { current: 14 } } as DashboardSummaryData,
    isLoading: false,
    isError: false,
  }

  const dashboardSummary = dashboardSummaryQuery.data
  const isInitialLoad = dashboardSummaryQuery.isLoading && !dashboardSummary
  const hasError = dashboardSummaryQuery.isError

  const sidebarProps = {
    mobileOpen: sidebarOpen,
    collapsed: sidebarCollapsed,
    onCloseMobile: () => setSidebarOpen(false),
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
        <div className="max-w-md rounded-2xl border border-[rgba(200,50,50,0.22)] bg-[#fdf8f5] p-6 text-center dark:bg-[#1e1c19]">
          <h1 className="font-['Playfair_Display',serif] text-[22px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
            Leaderboard unavailable
          </h1>
          <p className="mt-2 text-[13px] leading-[1.6] text-[#6b5f58] dark:text-[#9b9a92]">
            Something went wrong while loading leaderboard data.
          </p>
        </div>
      </div>
    )
  }

  const userInitials = getInitials(dashboardSummary.user.fullName)

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
            <div className="mx-auto mt-5.5 flex w-[min(1180px,calc(100%-48px))] max-w-full min-w-0 flex-col gap-8 pb-[calc(80px+env(safe-area-inset-bottom,0)+16px)] max-[900px]:mt-4.5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[640px]:mt-3 max-[640px]:w-[calc(100%-20px)]">

              {/* ── Page header ── */}
              <section className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-3 py-1 font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.12em] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#4caf7d] dark:bg-[#5cc98a]" />
                    Compete
                  </div>
                  <h1 className="font-['Playfair_Display',serif] text-[clamp(26px,3.5vw,38px)] font-extrabold leading-[1.15] tracking-[-0.8px] text-[#1a1714] dark:text-[#f2f0eb]">
                    Arena{' '}
                    <span className="text-[#b84c2b] dark:text-[#e8816a]">Leaderboard</span>
                  </h1>
                  <p className="mt-2 max-w-125 text-[13px] italic leading-[1.55] text-[#6b5f58] opacity-80 dark:text-[#9b9a92]">
                    Track top learners, weekly streaks, and progress across the Imminiq community.
                  </p>
                </div>

                {/* Rank card */}
                <div className="rounded-[16px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-4 flex items-center gap-4 dark:border-white/9 dark:bg-[#1e1c19] max-[560px]:w-full">
                  <div>
                    <div className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.12em] text-[#9b9a92] mb-1">Your Current Rank</div>
                    <div className="font-['Playfair_Display',serif] text-[36px] font-[900] leading-none text-[#b84c2b] dark:text-[#e8816a]">
                      #128
                    </div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-[10px] border-[1.5px] border-[rgba(45,106,71,0.22)] bg-[rgba(45,106,71,0.07)] dark:border-[rgba(92,201,138,0.2)]">
                    <span className="text-[#2d6a47] dark:text-[#5cc98a]">
                      <TrendUpIcon />
                    </span>
                    <span className="font-['DM_Mono',monospace] text-[10px] font-bold text-[#2d6a47] dark:text-[#5cc98a] ml-0.5">12</span>
                  </div>
                </div>
              </section>

              {/* ── Section tab switcher + controls row ── */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Students / Trainers tab */}
                <SectionTabSwitcher active={activeSection} onChange={(s) => { setActiveSection(s); setSearch('') }} />

                {/* Scope pills */}
                <div className="flex bg-[#fdf8f5] border-[1.5px] border-[#e0d0c5] rounded-[10px] p-[3px] gap-[2px] dark:bg-[#1e1c19] dark:border-white/9" role="group" aria-label="Leaderboard scope">
                  {SCOPES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setScope(s)}
                      className={cn(
                        'px-[14px] py-[5px] rounded-[7px] border-none cursor-pointer text-[12px] font-bold transition-all',
                        scope === s
                          ? 'bg-[#b84c2b] text-white dark:bg-[#e8816a] dark:text-[#141412]'
                          : 'bg-transparent text-[#6b5f58] dark:text-[#9b9a92]',
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative flex-1 min-w-[180px] max-w-[280px]">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9b9a92]">
                    <SearchIcon />
                  </span>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={activeSection === 'students' ? 'Search scholars…' : 'Search trainers…'}
                    className="w-full rounded-[10px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] py-[7px] pl-8 pr-3 text-[12px] text-[#1a1714] outline-none placeholder:text-[#9b9a92] focus:border-[rgba(184,76,43,0.3)] dark:border-white/9 dark:bg-[#1e1c19] dark:text-[#f2f0eb]"
                  />
                </div>

                {/* Track select */}
                <div className="relative">
                  <select
                    value={trackFilter}
                    onChange={(e) => setTrackFilter(e.target.value)}
                    aria-label="Filter by track"
                    className="appearance-none cursor-pointer rounded-[10px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] py-[7px] pl-3 pr-8 text-[12px] text-[#6b5f58] outline-none dark:border-white/9 dark:bg-[#1e1c19] dark:text-[#9b9a92]"
                  >
                    {TRACKS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9b9a92]"><ChevronDownIcon /></span>
                </div>

                {/* Time select */}
                <div className="relative">
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    aria-label="Filter by time"
                    className="appearance-none cursor-pointer rounded-[10px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] py-[7px] pl-3 pr-8 text-[12px] text-[#6b5f58] outline-none dark:border-white/9 dark:bg-[#1e1c19] dark:text-[#9b9a92]"
                  >
                    {TIME_FILTERS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9b9a92]"><ChevronDownIcon /></span>
                </div>
              </div>

              {/* ── Active leaderboard section (one at a time) ── */}
              <LeaderboardSection
                key={activeSection}
                section={activeSection}
                scope={scope}
                search={search}
                trackFilter={trackFilter}
              />

            </div>

            <AppFooter />
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  )
}