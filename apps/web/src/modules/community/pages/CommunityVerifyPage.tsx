import React, { useState, type Dispatch, type SetStateAction } from 'react'
import { useNavigate } from 'react-router-dom'

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

// ── Types ─────────────────────────────────────────────────────────────────

interface VerifyItem {
  _id: string
  title: string
  category: string
  timeLeft: string
  excerpt: string
  progress: number
  votedPass: boolean
  closed: boolean
  urgent: boolean
}

interface LeaderboardEntry {
  rank: number
  name: string
  earned: string
  badge: string
  isMe?: boolean
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

const ArrowLeftIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const TrophyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 9H4a2 2 0 01-2-2V5h4M18 9h2a2 2 0 002-2V5h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M6 5h12v5a6 6 0 01-12 0V5z" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 16v4M8 20h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const SparklesIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z" fill="currentColor" />
    <path d="M5 15L5.74 18.26L9 19L5.74 19.74L5 23L4.26 19.74L1 19L4.26 18.26L5 15Z" fill="currentColor" opacity="0.6" />
    <path d="M19 2L19.5 4.5L22 5L19.5 5.5L19 8L18.5 5.5L16 5L18.5 4.5L19 2Z" fill="currentColor" opacity="0.6" />
  </svg>
)

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const DotsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="5" cy="12" r="1.5" fill="currentColor" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    <circle cx="19" cy="12" r="1.5" fill="currentColor" />
  </svg>
)

const CoinsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
    <path d="M18.09 10.37A6 6 0 1110.37 18.09" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 8h2.5M7 10h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// ── Noise overlay ─────────────────────────────────────────────────────────

const NoiseOverlay = () => (
  <div
    className="pointer-events-none fixed inset-0 z-0 opacity-[0.025] dark:opacity-[0.04]"
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
  <div className="relative min-h-screen overflow-x-clip bg-[#f5ede4] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]" role="status" aria-label="Loading verify">
    <NoiseOverlay />
    <div className="relative z-1 flex min-h-screen w-full overflow-x-clip">
      <Sidebar
        mobileOpen={sidebarOpen}
        collapsed={sidebarCollapsed}
        onCloseMobile={() => setSidebarOpen(false)}
        onToggleCollapsed={() => setSidebarCollapsed((v) => { const next = !v; localStorage.setItem('imminiq_sb', next ? 'closed' : 'open'); return next })}
      />
      <main className={cn('flex min-w-0 flex-1 flex-col overflow-x-clip transition-[margin] duration-300', sidebarCollapsed ? 'min-[901px]:ml-0' : 'min-[901px]:ml-56')}>
        <TopBar onMenuClick={() => setSidebarOpen(true)} streakDays={0} userName="Loading" userInitials="IM" userLevel="Loading" isGuest={false} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mx-auto mt-5.5 flex w-[min(1180px,calc(100%-48px))] max-w-full min-w-0 flex-col gap-6 pb-[calc(80px+env(safe-area-inset-bottom,0)+16px)] max-[900px]:mt-4.5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[640px]:mt-3 max-[640px]:w-[calc(100%-20px)]">
            <SkeletonBlock className="h-5 w-24 rounded-full" />
            <SkeletonBlock className="h-9 w-[min(420px,100%)] rounded-2xl" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[0, 1, 2, 3].map((i) => <div key={i} className="h-30 animate-pulse rounded-2xl bg-[#e8ddd6] dark:bg-white/10" />)}
            </div>
          </div>
          <AppFooter />
        </div>
      </main>
    </div>
    <BottomNav />
  </div>
)

// ── Stat card — identical pattern to CommunityBrowsePage ─────────────────

const StatCard = ({
  label,
  value,
  helper,
  accent,
  action,
}: {
  label: string
  value: string | number
  helper: string
  accent: { light: string; dark: string }
  action?: React.ReactNode
}) => (
  <div className="group relative overflow-hidden rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] transition hover:-translate-y-0.5 hover:border-[rgba(184,76,43,0.20)] hover:shadow-[0_10px_40px_rgba(26,23,20,0.10)] dark:border-white/10 dark:bg-[#1c1a18] dark:hover:border-white/20 flex flex-col">
    {/* Accent bar — light */}
    <div
      className="absolute inset-x-0 top-0 h-[2.5px] dark:hidden"
      style={{ background: `linear-gradient(90deg, transparent, ${accent.light}, transparent)` }}
    />
    {/* Accent bar — dark */}
    <div
      className="absolute inset-x-0 top-0 hidden h-[2.5px] dark:block"
      style={{ background: `linear-gradient(90deg, transparent, ${accent.dark}, transparent)` }}
    />
    <div className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.14em] text-[#6b5f58] opacity-70 dark:text-[#9b9a92]">
      {label}
    </div>
    <div className="mt-4 font-['Playfair_Display',serif] text-[34px] font-black leading-none tracking-[-1.5px] text-[#1a1714] dark:text-[#f2f0eb]">
      {value}
    </div>
    <p className="mt-3 text-[12px] leading-normal text-[#6b5f58] dark:text-[#6b6560] flex-1">{helper}</p>
    {action && <div className="mt-3">{action}</div>}
  </div>
)

// ── Progress bar ──────────────────────────────────────────────────────────

const ProgressBar = ({ value, color = '#4caf7d' }: { value: number; color?: string }) => (
  <div className="h-0.75 rounded-full bg-[rgba(26,23,20,0.08)] dark:bg-white/10">
    <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, background: color }} />
  </div>
)

// ── Verify card ───────────────────────────────────────────────────────────

const VerifyCard = ({ item, onPreview }: { item: VerifyItem; onPreview: (id: string) => void }) => (
  <div className={cn(
    'rounded-[18px] border-[1.5px] flex flex-col transition-all duration-200 bg-[#fdf8f5] dark:bg-[#1e1c19]',
    'hover:shadow-[0_8px_32px_rgba(26,23,20,0.10)] hover:-translate-y-0.5 dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
    item.closed
      ? 'border-[#e0d0c5] opacity-60 dark:border-white/9'
      : item.urgent
      ? 'border-[#e0d0c5] border-l-[3px] border-l-[#c49a2c] dark:border-white/9 dark:border-l-[#c49a2c]'
      : 'border-[#e0d0c5] border-l-[3px] border-l-[rgba(184,76,43,0.35)] hover:border-l-[rgba(184,76,43,0.55)] dark:border-white/9 dark:border-l-[rgba(232,129,106,0.35)]',
  )}>
    <div className="p-4 flex flex-col flex-1 gap-0">

      {/* Top row */}
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          <span className="inline-flex items-center rounded-full border border-[#e0d0c5] bg-[rgba(26,23,20,0.04)] px-2 py-[2.5px] font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-widest text-[#9b9a92] dark:border-white/9 dark:bg-white/4 shrink-0">
            Tracker
          </span>
          <span className="inline-flex items-center rounded-full border border-[#e0d0c5] bg-[rgba(26,23,20,0.04)] px-2 py-[2.5px] font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-widest text-[#9b9a92] dark:border-white/9 dark:bg-white/4 shrink-0">
            {item.category}
          </span>
          {item.urgent && (
            <span className="inline-flex items-center rounded-full border border-[#c49a2c] bg-[rgba(196,154,44,0.08)] px-2 py-[2.5px] font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-widest font-bold text-[#7c5a1e] dark:text-[#c49a2c] shrink-0">
              Urgent
            </span>
          )}
        </div>
        <button type="button" aria-label="More options" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[#9b9a92] transition hover:bg-[rgba(26,23,20,0.06)] dark:hover:bg-white/8">
          <DotsIcon />
        </button>
      </div>

      <h3 className="font-['Playfair_Display',serif] text-[14px] font-extrabold leading-tight text-[#1a1714] dark:text-[#f2f0eb] mb-1.5">
        {item.title}
      </h3>
      <p className="text-[11.5px] italic leading-normal text-[#6b5f58] dark:text-[#9b9a92] mb-3 line-clamp-2">
        "{item.excerpt}…"
      </p>

      <ProgressBar value={item.progress} color={item.urgent ? '#c49a2c' : '#4caf7d'} />

      {/* Stats row */}
      <div className="mt-3 grid grid-cols-3 divide-x divide-[#e8ddd6] dark:divide-white/8 border border-[#e8ddd6] dark:border-white/8 rounded-[10px] overflow-hidden mb-3">
        <div className="flex flex-col items-center py-2">
          <span className="font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-widest text-[#9b9a92] mb-0.5">Progress</span>
          <span className="font-['Playfair_Display',serif] text-[12px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">{item.progress}%</span>
        </div>
        <div className="flex flex-col items-center py-2">
          <span className="font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-widest text-[#9b9a92] mb-0.5">Time left</span>
          <span className="flex items-center gap-0.5 font-['Playfair_Display',serif] text-[12px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
            {item.closed ? (
              <span className="text-[#9b9a92] text-[11px]">Closed</span>
            ) : item.timeLeft ? (
              <><ClockIcon />{item.timeLeft}</>
            ) : (
              <span className="text-[#9b9a92]">—</span>
            )}
          </span>
        </div>
        <div className="flex flex-col items-center py-2">
          <span className="font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-widest text-[#9b9a92] mb-0.5">Status</span>
          <span className="font-['Playfair_Display',serif] text-[12px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
            {item.votedPass ? 'Voted' : item.closed ? 'Closed' : 'Open'}
          </span>
        </div>
      </div>

      {/* Footer CTA */}
      {item.votedPass ? (
        <div className="flex items-center gap-2 mt-auto">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#2d6a47] text-white shrink-0">
            <CheckIcon />
          </span>
          <div>
            <div className="text-[11.5px] font-bold text-[#2d6a47] dark:text-[#5cc98a]">Voted Pass</div>
            <div className="text-[10px] text-[#9b9a92]">Awaiting consensus</div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between mt-auto gap-2">
          <span className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-widest text-[#9b9a92] leading-tight">
            {item.closed ? 'Closed' : 'Not reviewed'}
          </span>
          <button
            type="button"
            onClick={() => onPreview(item._id)}
            disabled={item.closed}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-lg border-[1.5px] px-3 py-1.25 text-[11.5px] font-bold transition',
              item.closed
                ? 'border-[#e0d0c5] text-[#9b9a92] cursor-not-allowed dark:border-white/9'
                : 'border-[rgba(184,76,43,0.22)] text-[#b84c2b] hover:border-[rgba(184,76,43,0.4)] hover:bg-[rgba(184,76,43,0.07)] dark:border-[rgba(232,129,106,0.25)] dark:text-[#e8816a] dark:hover:bg-[rgba(232,129,106,0.08)]',
            )}
          >
            Preview
          </button>
        </div>
      )}
    </div>
  </div>
)

// ── Mock data ─────────────────────────────────────────────────────────────

const VERIFY_ITEMS: VerifyItem[] = [
  { _id: 'v1', title: 'Byzantine Trade Routes in the 11th Century',     category: 'History',      timeLeft: '2h',  excerpt: 'Revised data points for the Silk Road maritime branch',                progress: 62, votedPass: false, closed: false, urgent: false },
  { _id: 'v2', title: 'Stoic Influence on Medieval Philosophy',          category: 'Philosophy',   timeLeft: '4h',  excerpt: 'Comparison of 13th century Latin translations of Seneca',              progress: 48, votedPass: false, closed: false, urgent: false },
  { _id: 'v3', title: 'Mycelial Networks in Sub-Arctic Tundra',          category: 'Biology',      timeLeft: '',    excerpt: 'Revised carbon sequestration rates across permafrost zones',             progress: 88, votedPass: true,  closed: true,  urgent: false },
  { _id: 'v4', title: 'Phonetic Shifts in Old Norse Dialects',           category: 'Linguistics',  timeLeft: '12h', excerpt: 'Mapping the vowel mutations across the Jutland peninsula',              progress: 28, votedPass: false, closed: false, urgent: false },
  { _id: 'v5', title: 'Post-War Recovery Models',                        category: 'Economics',    timeLeft: '1h',  excerpt: 'Critical review of fiscal multiplier efficacy in reconstructed states', progress: 71, votedPass: false, closed: false, urgent: true  },
  { _id: 'v6', title: 'Stellar Nucleosynthesis Corrections',             category: 'Astrophysics', timeLeft: '1d',  excerpt: 'Proposed corrections for carbon-burning phase timelines',                progress: 18, votedPass: false, closed: false, urgent: false },
]

const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'S. Okafor', earned: '8.4k', badge: '🥇' },
  { rank: 2, name: 'M. Tanaka', earned: '6.1k', badge: '🥈' },
  { rank: 3, name: 'A. Reddy',  earned: '2.4k', badge: '🥉', isMe: true },
]

// accent palette — same ramps as CommunityBrowsePage ACCENT_COLORS
const STAT_ACCENTS = {
  amber:  { light: '#c49a2c', dark: '#f0a832' },
  green:  { light: '#2d6a47', dark: '#3dbf82' },
  rust:   { light: '#b84c2b', dark: '#e8816a' },
  purple: { light: '#6b46c1', dark: '#a78bfa' },
} as const

// ── Page ──────────────────────────────────────────────────────────────────

export default function CommunityVerifyPage() {
  const navigate = useNavigate()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem('imminiq_sb') === 'closed',
  )

  const dashboardSummaryQuery = {
    data: { user: { fullName: 'Arjun Reddy', avatarUrl: null, isPremium: false }, streak: { current: 7 } } as DashboardSummaryData,
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
    onToggleCollapsed: () => setSidebarCollapsed((v) => {
      const next = !v
      localStorage.setItem('imminiq_sb', next ? 'closed' : 'open')
      return next
    }),
  }

  if (isInitialLoad) return (
    <PageSkeleton
      sidebarOpen={sidebarOpen}
      sidebarCollapsed={sidebarCollapsed}
      setSidebarOpen={setSidebarOpen}
      setSidebarCollapsed={setSidebarCollapsed}
    />
  )

  if (hasError || !dashboardSummary) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5ede4] px-4 dark:bg-[#141412]">
        <div className="max-w-md rounded-2xl border border-[rgba(200,50,50,0.22)] bg-[#fdf8f5] p-6 text-center dark:bg-[#1e1c19]">
          <h1 className="font-['Playfair_Display',serif] text-[22px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">Page unavailable</h1>
          <p className="mt-2 text-[13px] leading-[1.6] text-[#6b5f58] dark:text-[#9b9a92]">Something went wrong loading verify data.</p>
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
            <div className="mx-auto mt-5.5 flex w-[min(1180px,calc(100%-48px))] max-w-full min-w-0 flex-col gap-6 pb-[calc(80px+env(safe-area-inset-bottom,0)+16px)] max-[900px]:mt-4.5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[640px]:mt-3 max-[640px]:w-[calc(100%-20px)]">

              {/* ── Back link ── */}
              <button
                type="button"
                onClick={() => navigate('/community')}
                className="inline-flex items-center gap-1.5 self-start font-['DM_Mono',monospace] text-[11px] uppercase tracking-widest text-[#9b9a92] transition hover:text-[#6b5f58] dark:hover:text-[#c5c0b8]"
              >
                <ArrowLeftIcon /> Back to community
              </button>

              {/* ── Header ── */}
              <section className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-[rgba(196,154,44,0.2)] bg-[rgba(196,154,44,0.08)] px-3 py-1 font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.12em] text-[#7c5a1e] dark:border-[rgba(196,154,44,0.3)] dark:bg-[rgba(196,154,44,0.10)] dark:text-[#c49a2c]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#c49a2c]" />
                    Verify &amp; earn
                  </div>
                  <h1 className="font-['Playfair_Display',serif] text-[clamp(26px,3.5vw,38px)] font-extrabold leading-[1.15] tracking-[-0.8px] text-[#1a1714] dark:text-[#f2f0eb]">
                    Review trackers · <span className="text-[#c49a2c]">Earn coins</span>
                  </h1>
                  <p className="mt-2 max-w-125 text-[13px] italic leading-[1.55] text-[#6b5f58] opacity-80 dark:text-[#9b9a92]">
                    Validate community submissions and keep the knowledge commons accurate.
                  </p>
                </div>

                {/* Queue + reward callout — softened, not competing with stat cards */}
                <div className="flex items-center gap-5 rounded-[14px] border-[1.5px] border-[rgba(196,154,44,0.18)] bg-[rgba(196,154,44,0.05)] px-5 py-3.5 dark:border-[rgba(196,154,44,0.15)] dark:bg-[rgba(196,154,44,0.04)]">
                  <div className="text-center">
                    <div className="font-['Playfair_Display',serif] text-[26px] font-black text-[#1a1714] dark:text-[#f2f0eb] leading-none">7</div>
                    <div className="font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-widest text-[#9b9a92] mt-1">In queue</div>
                  </div>
                  <div className="w-px h-7 bg-[rgba(196,154,44,0.18)]" />
                  <div className="text-center">
                    <div className="font-['Playfair_Display',serif] text-[26px] font-black text-[#c49a2c] leading-none">+50</div>
                    <div className="font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-widest text-[#9b9a92] mt-1">Per review</div>
                  </div>
                </div>
              </section>

              {/* ── Stats — 4 cards, 2-col on mobile, 4-col on sm+ ── */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard
                  label="Awaiting"
                  value="12"
                  helper="Submissions to review"
                  accent={STAT_ACCENTS.amber}
                />
                <StatCard
                  label="Reviewed"
                  value="142"
                  helper="Verified by you total"
                  accent={STAT_ACCENTS.green}
                />
                <StatCard
                  label="Total earned"
                  value="2.4k"
                  helper="Coins from reviews"
                  accent={STAT_ACCENTS.rust}
                />
                {/* ── Coin balance with redeem CTA ── */}
                <StatCard
                  label="Coin balance"
                  value="2.4k"
                  helper="Available to redeem"
                  accent={STAT_ACCENTS.purple}
                  action={
                    <button
                      type="button"
                      onClick={() => navigate('/store')}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-[rgba(107,70,193,0.28)] bg-[rgba(107,70,193,0.07)] px-3 py-1.5 font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.08em] font-bold text-[#6b46c1] transition hover:border-[rgba(107,70,193,0.45)] hover:bg-[rgba(107,70,193,0.13)] dark:border-[rgba(167,139,250,0.3)] dark:bg-[rgba(167,139,250,0.08)] dark:text-[#a78bfa] dark:hover:bg-[rgba(167,139,250,0.15)]"
                    >
                      <CoinsIcon /> Redeem store <ArrowRightIcon />
                    </button>
                  }
                />
              </div>

              {/* ── Main content: queue + sidebar ── */}
              <div className="flex gap-6 items-start max-[860px]:flex-col">

                {/* Left: queue */}
                <div className="flex-1 min-w-0 flex flex-col gap-4">

                  {/* Section heading */}
                  <div className="flex items-center justify-between">
                    <span className="font-['Playfair_Display',serif] text-[16px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
                      Open for review
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.07)] px-3 py-1 font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-widest text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:text-[#e8816a]">
                      7 pending
                    </span>
                  </div>

                  {/* Verify card grid — 2-col max to prevent cramping */}
                  <div className="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1">
                    {VERIFY_ITEMS.map((item) => (
                      <VerifyCard key={item._id} item={item} onPreview={(id) => navigate(`/community/verify/${id}`)} />
                    ))}
                  </div>
                </div>

                {/* Right sidebar — widened to 272px */}
                <aside className="w-68 shrink-0 flex flex-col gap-4 max-[860px]:w-full max-[860px]:grid max-[860px]:grid-cols-2 max-[560px]:grid-cols-1">

                  {/* Top verifiers */}
                  <div className="rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 dark:border-white/9 dark:bg-[#1e1c19]">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[#c49a2c]"><TrophyIcon /></span>
                      <span className="font-['Playfair_Display',serif] text-[14px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">Top verifiers</span>
                    </div>
                    <div className="flex flex-col">
                      {LEADERBOARD.map(({ rank, name, earned, badge, isMe }) => (
                        <div
                          key={rank}
                          className={cn(
                            'flex items-center gap-2.5 py-2.5 border-b border-[#e8ddd6] last:border-b-0 dark:border-white/8',
                            isMe && 'rounded-lg bg-[rgba(184,76,43,0.05)] px-2 -mx-2 dark:bg-[rgba(232,129,106,0.05)]',
                          )}
                        >
                          <span className="text-[15px] w-5 text-center shrink-0">{badge}</span>
                          <span className={cn('flex-1 min-w-0 truncate text-[12.5px]', isMe ? 'font-bold text-[#b84c2b] dark:text-[#e8816a]' : 'text-[#1a1714] dark:text-[#f2f0eb]')}>
                            {name}{isMe ? ' (you)' : ''}
                          </span>
                          <span className="font-['DM_Mono',monospace] text-[11px] text-[#9b9a92] shrink-0">{earned}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* How it works */}
                  <div className="rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 dark:border-white/9 dark:bg-[#1e1c19]">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[#b84c2b] dark:text-[#e8816a]"><SparklesIcon /></span>
                      <span className="font-['Playfair_Display',serif] text-[14px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">How it works</span>
                    </div>
                    <div className="flex flex-col gap-3">
                      {([
                        { step: '01', text: 'Pick a tracker from the queue' },
                        { step: '02', text: 'Preview the submitted changes' },
                        { step: '03', text: 'Vote Pass or Fail' },
                        { step: '04', text: 'Earn +50 coins if in majority' },
                      ] as { step: string; text: string }[]).map(({ step, text }) => (
                        <div key={step} className="flex items-start gap-3">
                          <span className="font-['DM_Mono',monospace] text-[9px] font-bold text-[#b84c2b] dark:text-[#e8816a] mt-0.5 shrink-0 w-4">{step}</span>
                          <span className="text-[12px] text-[#6b5f58] dark:text-[#9b9a92] leading-normal">{text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Scholar's tip — softened: uses border instead of hard black bg */}
                  <div className="rounded-[18px] border-[1.5px] border-[rgba(196,154,44,0.18)] bg-[rgba(196,154,44,0.04)] p-5 dark:border-[rgba(196,154,44,0.15)] dark:bg-[rgba(196,154,44,0.04)] max-[860px]:col-span-2 max-[560px]:col-span-1">
                    <div className="flex items-center gap-1.5 font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.12em] text-[#9b9a92] mb-3">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M9 18h6M12 2a7 7 0 017 7c0 2.5-1.3 4.7-3.3 6H8.3A7 7 0 015 9a7 7 0 017-7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M9 18v2a1 1 0 001 1h4a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                      Scholar's tip
                    </div>
                    <p className="font-['Playfair_Display',serif] text-[13px] italic text-[#1a1714] dark:text-[#e0d5cb] leading-[1.65] mb-2.5">
                      "Peer review is the backbone of reliable scholarship. Your vote shapes the knowledge commons."
                    </p>
                    <div className="text-[11px] text-[#9b9a92] text-right">— The Imminiq Team</div>
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