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

type CommunityTab = 'browse' | 'verify'

type ToneName = 'rust' | 'green' | 'amber' | 'neutral'

interface Tracker {
  _id: string
  title: string
  description: string
  rating: number
  clones: number
  verified: boolean
  inDashboard: boolean
  topic: string
}

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

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M7 1.5V12.5M1.5 7H12.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
)

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" />
    <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
)

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} aria-hidden="true">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

const VerifiedIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const CopyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

const TrackerCardSkeleton = () => (
  <div className="animate-pulse rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 dark:border-white/9 dark:bg-[#1e1c19]">
    <div className="flex justify-between mb-3">
      <div className="h-5 w-20 rounded-full bg-[#e8ddd6] dark:bg-white/10" />
      <div className="h-5 w-8 rounded-full bg-[#e8ddd6] dark:bg-white/10" />
    </div>
    <div className="h-5 w-3/4 rounded-lg bg-[#e8ddd6] dark:bg-white/10 mb-2" />
    <div className="h-3 w-full rounded bg-[#e8ddd6] dark:bg-white/10 mb-1" />
    <div className="h-3 w-2/3 rounded bg-[#e8ddd6] dark:bg-white/10 mb-5" />
    <div className="flex justify-between items-center pt-3 border-t border-[#e8ddd6] dark:border-white/8">
      <div className="h-4 w-20 rounded bg-[#e8ddd6] dark:bg-white/10" />
      <div className="h-7 w-24 rounded-[8px] bg-[#e8ddd6] dark:bg-white/10" />
    </div>
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
    aria-label="Loading community"
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
      <main
        className={cn(
          'flex min-w-0 flex-1 flex-col overflow-x-clip transition-[margin] duration-300',
          sidebarCollapsed ? 'min-[901px]:ml-0' : 'min-[901px]:ml-56',
        )}
      >
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          streakDays={0}
          userName="Loading"
          userInitials="IM"
          userLevel="Loading"
          isGuest={false}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mx-auto mt-5.5 flex w-[min(1180px,calc(100%-48px))] max-w-full min-w-0 flex-col gap-6 pb-[calc(80px+env(safe-area-inset-bottom,0)+16px)] max-[900px]:mt-4.5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[640px]:mt-3 max-[640px]:w-[calc(100%-20px)]">
            <section className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-3">
                <SkeletonBlock className="h-5 w-24 rounded-full" />
                <SkeletonBlock className="h-9 w-[min(480px,100%)] rounded-2xl" />
                <SkeletonBlock className="h-4 w-[min(560px,100%)]" />
              </div>
              <SkeletonBlock className="h-10 w-36 rounded-[10px]" />
            </section>
            <div className="flex gap-6 border-b border-[#e0d0c5] pb-px dark:border-white/9">
              <SkeletonBlock className="h-4 w-28 rounded" />
              <SkeletonBlock className="h-4 w-24 rounded" />
            </div>
            <div className="grid grid-cols-3 gap-4 max-[860px]:grid-cols-2 max-[540px]:grid-cols-1">
              {Array.from({ length: 6 }).map((_, i) => <TrackerCardSkeleton key={i} />)}
            </div>
          </div>
          <AppFooter />
        </div>
      </main>
    </div>
    <BottomNav />
    <span className="sr-only">Loading community content</span>
  </div>
)

// ── Stat card (matches MockStatCard from MockTestsPage) ───────────────────

const TONE_MAP = {
  rust:    { val: 'text-[#b84c2b] dark:text-[#e8816a]',    bar: 'border-[#b84c2b] dark:border-[#e8816a]' },
  green:   { val: 'text-[#2d6a47] dark:text-[#5cc98a]',    bar: 'border-[#4caf7d] dark:border-[#5cc98a]' },
  amber:   { val: 'text-[#7c5a1e] dark:text-[#c49a2c]',    bar: 'border-[#c49a2c]' },
  neutral: { val: 'text-[#1a1714] dark:text-[#f2f0eb]',    bar: 'border-[#e0d0c5] dark:border-white/9' },
} as const

const StatCard = ({
  label,
  value,
  helper,
  tone,
}: {
  label: string
  value: string | number
  helper: string
  tone: ToneName
}) => (
  <div className={cn(
    'rounded-[16px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-[18px] flex flex-col gap-1.5 border-b-[3px] dark:border-white/9 dark:bg-[#1e1c19]',
    TONE_MAP[tone].bar,
  )}>
    <span className="font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.12em] text-[#9b9a92]">
      {label}
    </span>
    <span className={cn("font-['Playfair_Display',serif] text-[24px] font-[800] tracking-[-0.5px]", TONE_MAP[tone].val)}>
      {value}
    </span>
    <span className="text-[11px] text-[#9b9a92]">{helper}</span>
  </div>
)

// ── Progress bar ──────────────────────────────────────────────────────────

const ProgressBar = ({ value, color = '#4caf7d' }: { value: number; color?: string }) => (
  <div className="h-[4px] rounded-full bg-[rgba(26,23,20,0.08)] dark:bg-white/10 mt-3 mb-3">
    <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, background: color }} />
  </div>
)

// ── Tracker card ──────────────────────────────────────────────────────────

const TrackerCard = ({
  tracker,
  onClone,
}: {
  tracker: Tracker
  onClone: (id: string) => void
}) => (
  <div className={cn(
    'rounded-[18px] border-[1.5px] bg-[#fdf8f5] p-5 flex flex-col transition hover:border-[rgba(184,76,43,0.25)] dark:bg-[#1e1c19]',
    tracker.verified
      ? 'border-[rgba(45,106,71,0.25)] dark:border-[rgba(92,201,138,0.18)]'
      : 'border-[#e0d0c5] dark:border-white/9',
  )}>
    {/* Top row */}
    <div className="flex items-start justify-between mb-3">
      {tracker.verified ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(45,106,71,0.22)] bg-[rgba(45,106,71,0.08)] px-[9px] py-[3px] font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.1em] text-[#2d6a47] dark:text-[#5cc98a]">
          <VerifiedIcon /> Verified
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-full border border-[#e0d0c5] bg-[rgba(26,23,20,0.04)] px-[9px] py-[3px] font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.1em] text-[#9b9a92] dark:border-white/9 dark:bg-white/4">
          Community
        </span>
      )}
      <span className="flex items-center gap-1 font-['DM_Mono',monospace] text-[11px] text-[#c49a2c]">
        <StarIcon filled /> {tracker.rating.toFixed(1)}
      </span>
    </div>

    {/* Title & description */}
    <h3 className="font-['Playfair_Display',serif] text-[16px] font-[800] leading-[1.25] text-[#1a1714] dark:text-[#f2f0eb] mb-2">
      {tracker.title}
    </h3>
    <p className="text-[12px] leading-[1.55] text-[#6b5f58] dark:text-[#9b9a92] mb-auto min-h-[36px]">
      {tracker.description}
    </p>

    {/* Footer */}
    <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-[#e8ddd6] dark:border-white/8">
      <span className="flex items-center gap-1 text-[11.5px] text-[#9b9a92]">
        <CopyIcon />
        {tracker.clones >= 1000 ? `${(tracker.clones / 1000).toFixed(1)}k` : tracker.clones} Clones
      </span>
      {tracker.inDashboard ? (
        <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-[rgba(45,106,71,0.22)] bg-[rgba(45,106,71,0.07)] px-[12px] py-[5px] text-[12px] font-bold text-[#2d6a47] dark:text-[#5cc98a]">
          <CheckIcon /> In dashboard
        </span>
      ) : (
        <button
          type="button"
          onClick={() => onClone(tracker._id)}
          className="inline-flex items-center gap-1.5 rounded-[8px] border-[1.5px] border-[rgba(184,76,43,0.22)] bg-transparent px-[12px] py-[5px] text-[12px] font-bold text-[#b84c2b] transition hover:bg-[rgba(184,76,43,0.07)] hover:border-[rgba(184,76,43,0.35)] dark:border-[rgba(232,129,106,0.25)] dark:text-[#e8816a]"
        >
          Clone tracker
        </button>
      )}
    </div>
  </div>
)

// ── Verify card ───────────────────────────────────────────────────────────

const VerifyCard = ({
  item,
  onPreview,
}: {
  item: VerifyItem
  onPreview: (id: string) => void
}) => (
  <div className={cn(
    'rounded-[18px] border-[1.5px] p-5 flex flex-col transition bg-[#fdf8f5] dark:bg-[#1e1c19]',
    item.closed
      ? 'border-[#e0d0c5] opacity-70 dark:border-white/9'
      : item.urgent
      ? 'border-[#c49a2c] dark:border-[#c49a2c]'
      : 'border-[#e0d0c5] hover:border-[rgba(184,76,43,0.22)] dark:border-white/9',
  )}>
    {/* Top row */}
    <div className="flex items-center justify-between mb-3">
      <span className="rounded-full border border-[#e0d0c5] bg-[rgba(26,23,20,0.04)] px-[9px] py-[3px] font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.1em] text-[#9b9a92] dark:border-white/9">
        {item.category}
      </span>
      <div className="flex items-center gap-2">
        {item.urgent && (
          <span className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.12em] font-bold text-[#c49a2c]">
            Urgent
          </span>
        )}
        {!item.closed && item.timeLeft && (
          <span className="flex items-center gap-1 text-[11px] text-[#9b9a92]">
            <ClockIcon /> {item.timeLeft} left
          </span>
        )}
        {item.closed && (
          <span className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.1em] text-[#9b9a92]">
            Closed
          </span>
        )}
      </div>
    </div>

    <h3 className="font-['Playfair_Display',serif] text-[15px] font-[800] leading-[1.25] text-[#1a1714] dark:text-[#f2f0eb] mb-2">
      {item.title}
    </h3>
    <p className="text-[12px] italic leading-[1.55] text-[#6b5f58] dark:text-[#9b9a92] mb-0">
      "{item.excerpt}…"
    </p>

    <ProgressBar value={item.progress} color={item.urgent ? '#c49a2c' : '#4caf7d'} />

    {item.votedPass ? (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#2d6a47] text-white flex-shrink-0">
          <CheckIcon />
        </span>
        <div>
          <div className="text-[12px] font-bold text-[#2d6a47] dark:text-[#5cc98a]">Voted Pass</div>
          <div className="text-[10.5px] text-[#9b9a92]">Wait for consensus</div>
        </div>
      </div>
    ) : (
      <button
        type="button"
        onClick={() => onPreview(item._id)}
        disabled={item.closed}
        className={cn(
          'w-fit rounded-[8px] border-[1.5px] px-[14px] py-[5px] text-[12px] font-bold transition',
          item.closed
            ? 'border-[#e0d0c5] text-[#9b9a92] cursor-not-allowed dark:border-white/9'
            : 'border-[rgba(184,76,43,0.22)] text-[#b84c2b] hover:bg-[rgba(184,76,43,0.07)] dark:border-[rgba(232,129,106,0.25)] dark:text-[#e8816a]',
        )}
      >
        preview
      </button>
    )}
  </div>
)

// ── Mock data ─────────────────────────────────────────────────────────────

const TRACKERS: Tracker[] = [
  { _id: 't1', title: 'Microeconomics Mastery', description: 'Complete path for graduate entry level micro theory and competitive economics preparation.', rating: 4.9, clones: 1200, verified: true,  inDashboard: false, topic: 'Economics' },
  { _id: 't2', title: 'Linear Algebra Deep-Dive', description: 'From basic vectors to spectral theorem with practical Python implementations.', rating: 4.2, clones: 840,  verified: false, inDashboard: true,  topic: 'CompSci'   },
  { _id: 't3', title: 'Medieval History: Europe', description: 'The rise and fall of feudalism across the central European kingdoms.',               rating: 4.5, clones: 312,  verified: false, inDashboard: false, topic: 'History'   },
  { _id: 't4', title: 'Modern Physics I',          description: 'Special relativity and early quantum mechanics for undergrads.',                      rating: 5.0, clones: 2100, verified: true,  inDashboard: false, topic: 'Science'   },
  { _id: 't5', title: 'Advanced SEO 2024',         description: 'Modern strategies for technical optimization and content hierarchy.',                  rating: 3.8, clones: 1800, verified: false, inDashboard: false, topic: 'CompSci'   },
  { _id: 't6', title: 'French B1: Immersion',      description: 'Reading and listening path focusing on contemporary literature.',                     rating: 4.7, clones: 540,  verified: false, inDashboard: false, topic: 'Languages' },
]

const VERIFY_ITEMS: VerifyItem[] = [
  { _id: 'v1', title: 'Byzantine Trade Routes in the 11th', category: 'History',     timeLeft: '2h',  excerpt: 'Revised data points for the Silk Road maritime branch',                    progress: 62, votedPass: false, closed: false, urgent: false },
  { _id: 'v2', title: 'Stoic Influence on Medieval…',       category: 'Philosophy',  timeLeft: '4h',  excerpt: 'Comparison of 13th century Latin translations of Seneca',                  progress: 48, votedPass: false, closed: false, urgent: false },
  { _id: 'v3', title: 'Mycelial Networks in Sub-Arctic Tundra', category: 'Biology', timeLeft: '',    excerpt: 'Revised carbon sequestration rates across permafrost zones',                 progress: 88, votedPass: true,  closed: true,  urgent: false },
  { _id: 'v4', title: 'Phonetic Shifts in Old Norse Dialects',  category: 'Linguistics', timeLeft: '12h', excerpt: 'Mapping the vowel mutations across the Jutland peninsula',              progress: 28, votedPass: false, closed: false, urgent: false },
  { _id: 'v5', title: 'Post-War Recovery Models',            category: 'Economics',  timeLeft: '1h',  excerpt: 'Critical review of fiscal multiplier efficacy in reconstructed states',      progress: 71, votedPass: false, closed: false, urgent: true  },
  { _id: 'v6', title: 'Stellar Nucleosynthesis…',            category: 'Astrophysics', timeLeft: '1d', excerpt: 'Proposed corrections for carbon-burning phase timelines',                  progress: 18, votedPass: false, closed: false, urgent: false },
]

const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'S. Okafor', earned: '8.4k', badge: '🥇' },
  { rank: 2, name: 'M. Tanaka', earned: '6.1k', badge: '🥈' },
  { rank: 3, name: 'A. Reddy',  earned: '2.4k', badge: '🥉', isMe: true },
]

const TOPICS = ['All Topics', 'Economics', 'CompSci', 'Bio-Med', 'History', 'Languages', 'Science'] as const

// ── Main page ─────────────────────────────────────────────────────────────

export default function CommunityPage() {
  const navigate = useNavigate()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem('imminiq_sb') === 'closed',
  )

  const [tab, setTab] = useState<CommunityTab>('browse')
  const [search, setSearch] = useState('')
  const [topicFilter, setTopicFilter] = useState('All Topics')

  // Replace with real hooks:
  // const dashboardSummaryQuery = useDashboardSummary()
  const dashboardSummaryQuery = {
    data: { user: { fullName: 'Arjun Reddy', avatarUrl: null, isPremium: false }, streak: { current: 7 } } as DashboardSummaryData,
    isLoading: false,
    isError: false,
  }

  const dashboardSummary = dashboardSummaryQuery.data
  const isInitialLoad = dashboardSummaryQuery.isLoading && !dashboardSummary
  const hasError = dashboardSummaryQuery.isError

  const filteredTrackers = TRACKERS.filter((t) => {
    const matchTopic = topicFilter === 'All Topics' || t.topic === topicFilter
    const matchSearch =
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
    return matchTopic && matchSearch
  })

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
            Community unavailable
          </h1>
          <p className="mt-2 text-[13px] leading-[1.6] text-[#6b5f58] dark:text-[#9b9a92]">
            Something went wrong while loading community data.
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
            <div className="mx-auto mt-5.5 flex w-[min(1180px,calc(100%-48px))] max-w-full min-w-0 flex-col gap-6 pb-[calc(80px+env(safe-area-inset-bottom,0)+16px)] max-[900px]:mt-4.5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[640px]:mt-3 max-[640px]:w-[calc(100%-20px)]">

              {/* ── Page header ── */}
              <section className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-3 py-1 font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.12em] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#4caf7d] dark:bg-[#5cc98a]" />
                    Knowledge Exchange
                  </div>
                  <h1 className="font-['Playfair_Display',serif] text-[clamp(26px,3.5vw,38px)] font-extrabold leading-[1.15] tracking-[-0.8px] text-[#1a1714] dark:text-[#f2f0eb]">
                    Community
                  </h1>
                  <p className="mt-2 max-w-125 text-[13px] italic leading-[1.55] text-[#6b5f58] opacity-80 dark:text-[#9b9a92]">
                    Join the collective effort to curate the finest academic paths.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/community/publish')}
                  className="inline-flex items-center gap-2 rounded-[10px] bg-[#1a1714] px-5 py-2.5 text-[13px] font-bold text-[#fdf8f5] transition hover:-translate-y-px hover:bg-[#2d2925] hover:shadow-[0_8px_24px_rgba(26,23,20,0.22)] dark:bg-[#f2f0eb] dark:text-[#1a1714] max-[560px]:w-full max-[560px]:justify-center"
                >
                  <PlusIcon />
                  Publish tracker
                </button>
              </section>

              {/* ── Tabs ── */}
              <div className="flex items-center gap-0 border-b border-[#e0d0c5] dark:border-white/9">
                {(
                  [
                    { key: 'browse', label: 'Browse trackers' },
                    { key: 'verify', label: 'Verify & earn', badge: 7 },
                  ] as { key: CommunityTab; label: string; badge?: number }[]
                ).map(({ key, label, badge }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTab(key)}
                    className={cn(
                      'relative mr-6 pb-3 pt-1 text-[14px] font-medium transition',
                      tab === key
                        ? "font-bold text-[#1a1714] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:rounded-full after:bg-[#b84c2b] after:content-[''] dark:text-[#f2f0eb]"
                        : 'text-[#9b9a92] hover:text-[#6b5f58] dark:hover:text-[#c5c0b8]',
                    )}
                  >
                    {label}
                    {badge != null && (
                      <span className="ml-1.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#c49a2c] px-1 font-['DM_Mono',monospace] text-[9px] font-bold text-white">
                        {badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* ── Browse tab ── */}
              {tab === 'browse' && (
                <div className="flex flex-col gap-5">
                  {/* Search + topic filters */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px] max-w-[480px]">
                      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9b9a92]">
                        <SearchIcon />
                      </span>
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search roadmaps, topics, or scholars…"
                        className="w-full rounded-[12px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] py-[9px] pl-9 pr-4 text-[13px] text-[#1a1714] outline-none placeholder:text-[#9b9a92] focus:border-[rgba(184,76,43,0.3)] dark:border-white/9 dark:bg-[#1e1c19] dark:text-[#f2f0eb]"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {TOPICS.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTopicFilter(t)}
                          className={cn(
                            "rounded-full border px-[14px] py-[6px] font-['DM_Mono',monospace] text-[11px] transition",
                            topicFilter === t
                              ? 'border-[rgba(184,76,43,0.22)] bg-[rgba(184,76,43,0.09)] text-[#b84c2b] font-bold dark:border-[rgba(232,129,106,0.25)] dark:text-[#e8816a]'
                              : 'border-[#e0d0c5] bg-[#fdf8f5] text-[#6b5f58] hover:border-[rgba(184,76,43,0.18)] dark:border-white/9 dark:bg-[#1e1c19] dark:text-[#9b9a92]',
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tracker grid */}
                  {filteredTrackers.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4 max-[860px]:grid-cols-2 max-[540px]:grid-cols-1">
                      {filteredTrackers.map((tracker) => (
                        <TrackerCard
                          key={tracker._id}
                          tracker={tracker}
                          onClone={(id) => navigate(`/community/tracker/${id}/clone`)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[22px] border-[1.5px] border-dashed border-[#e0d0c5] bg-[#fdf8f5] p-12 text-center dark:border-white/9 dark:bg-[#1e1c19] max-[640px]:p-6">
                      <p className="font-['Playfair_Display',serif] text-[18px] font-[800] text-[#1a1714] dark:text-[#f2f0eb]">
                        No trackers found
                      </p>
                      <p className="mt-2 text-[13px] text-[#9b9a92]">
                        Try a different topic or search term.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── Verify & earn tab ── */}
              {tab === 'verify' && (
                <div className="flex gap-5 items-start max-[860px]:flex-col">

                  {/* Left column */}
                  <div className="flex-1 min-w-0 flex flex-col gap-5">

                    {/* Hero banner */}
                    <div className="rounded-[20px] bg-[#1a1714] dark:bg-[#0e0d0b] p-6 flex flex-wrap items-center gap-5 justify-between">
                      <div>
                        <h2 className="font-['Playfair_Display',serif] text-[22px] font-[900] text-[#f2f0eb] leading-[1.2] mb-1.5">
                          Review trackers · Earn coins
                        </h2>
                        <p className="text-[13px] text-[#9b9a92] max-w-[380px] leading-[1.55]">
                          Validate submissions to ensure high-quality scholarly data.
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="font-['Playfair_Display',serif] text-[32px] font-[900] text-[#f2f0eb] leading-none">7</div>
                          <div className="font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.12em] text-[#9b9a92] mt-1">In Queue</div>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div className="text-center">
                          <div className="font-['Playfair_Display',serif] text-[32px] font-[900] text-[#c49a2c] leading-none">+50</div>
                          <div className="font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.12em] text-[#9b9a92] mt-1">If Majority</div>
                        </div>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3 max-[540px]:grid-cols-1">
                      <StatCard label="Awaiting"     value="12"   helper="Submissions to review" tone="amber"   />
                      <StatCard label="Reviewed"     value="142"  helper="Verified by you"       tone="green"   />
                      <StatCard label="Total earned" value="2.4k" helper="Coins from reviews"    tone="rust"    />
                    </div>

                    {/* Section heading */}
                    <div className="flex items-center justify-between">
                      <span className="font-['Playfair_Display',serif] text-[16px] font-[800] text-[#1a1714] dark:text-[#f2f0eb]">
                        Open for review
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.07)] px-3 py-1 font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.1em] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:text-[#e8816a]">
                        7 pending
                      </span>
                    </div>

                    {/* Verify cards */}
                    <div className="grid grid-cols-3 gap-4 max-[860px]:grid-cols-2 max-[540px]:grid-cols-1">
                      {VERIFY_ITEMS.map((item) => (
                        <VerifyCard
                          key={item._id}
                          item={item}
                          onPreview={(id) => navigate(`/community/verify/${id}`)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Right sidebar */}
                  <aside className="w-[248px] flex-shrink-0 flex flex-col gap-3.5 max-[860px]:w-full">

                    {/* Top verifiers */}
                    <div className="rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 dark:border-white/9 dark:bg-[#1e1c19]">
                      <div className="flex items-center gap-1.5 mb-4">
                        <span className="text-[#c49a2c]"><TrophyIcon /></span>
                        <span className="font-['Playfair_Display',serif] text-[15px] font-[800] text-[#1a1714] dark:text-[#f2f0eb]">
                          Top verifiers
                        </span>
                      </div>
                      {LEADERBOARD.map(({ rank, name, earned, badge, isMe }) => (
                        <div
                          key={rank}
                          className={cn(
                            'flex items-center gap-2.5 py-2.5 border-b border-[#e8ddd6] last:border-b-0 dark:border-white/8',
                            isMe && 'rounded-[8px] bg-[rgba(184,76,43,0.05)] px-2 -mx-2 dark:bg-[rgba(232,129,106,0.05)]',
                          )}
                        >
                          <span className="text-[16px] w-5 text-center">{badge}</span>
                          <span className={cn(
                            'flex-1 text-[13px]',
                            isMe
                              ? 'font-bold text-[#b84c2b] dark:text-[#e8816a]'
                              : 'text-[#1a1714] dark:text-[#f2f0eb]',
                          )}>
                            {name}{isMe ? ' (you)' : ''}
                          </span>
                          <span className="font-['DM_Mono',monospace] text-[11px] text-[#9b9a92]">{earned}</span>
                        </div>
                      ))}
                    </div>

                    {/* How it works */}
                    <div className="rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 dark:border-white/9 dark:bg-[#1e1c19]">
                      <div className="flex items-center gap-1.5 mb-3.5">
                        <span className="text-[#b84c2b] dark:text-[#e8816a]"><SparklesIcon /></span>
                        <span className="font-['Playfair_Display',serif] text-[15px] font-[800] text-[#1a1714] dark:text-[#f2f0eb]">
                          How it works
                        </span>
                      </div>
                      {(
                        [
                          { step: '01', text: 'Pick a tracker from the queue' },
                          { step: '02', text: 'Preview the submitted changes' },
                          { step: '03', text: 'Vote Pass or Fail' },
                          { step: '04', text: 'Earn +50 coins if in majority' },
                        ] as { step: string; text: string }[]
                      ).map(({ step, text }) => (
                        <div key={step} className="flex items-start gap-2.5 mb-3 last:mb-0">
                          <span className="font-['DM_Mono',monospace] text-[9px] font-bold text-[#b84c2b] dark:text-[#e8816a] mt-0.5 flex-shrink-0">
                            {step}
                          </span>
                          <span className="text-[12px] text-[#6b5f58] dark:text-[#9b9a92] leading-[1.5]">{text}</span>
                        </div>
                      ))}
                    </div>

                    {/* Scholar's tip */}
                    <div className="rounded-[18px] bg-[#1a1714] dark:bg-[#0e0d0b] p-[18px_18px_14px]">
                      <div className="flex items-center gap-1.5 font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.12em] text-[#9b9a92] mb-2.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M9 18h6M12 2a7 7 0 017 7c0 2.5-1.3 4.7-3.3 6H8.3A7 7 0 015 9a7 7 0 017-7z" stroke="#9b9a92" strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M9 18v2a1 1 0 001 1h4a1 1 0 001-1v-2" stroke="#9b9a92" strokeWidth="1.5" />
                        </svg>
                        Scholar's tip
                      </div>
                      <p className="font-['Playfair_Display',serif] text-[13px] italic text-[#e0d5cb] leading-[1.65] mb-2.5">
                        "Peer review is the backbone of reliable scholarship. Your vote shapes the knowledge commons."
                      </p>
                      <div className="text-[11px] text-[#9b9a92] text-right">— The Imminiq Team</div>
                    </div>

                  </aside>
                </div>
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