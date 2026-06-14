import React, { useState, useRef, useEffect, type Dispatch, type SetStateAction } from 'react'
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

const BookOpenIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M2 6.5A2.5 2.5 0 014.5 4H12v16H4.5A2.5 2.5 0 012 17.5V6.5z" stroke="currentColor" strokeWidth="1.75" />
    <path d="M22 6.5A2.5 2.5 0 0019.5 4H12v16h7.5A2.5 2.5 0 0022 17.5V6.5z" stroke="currentColor" strokeWidth="1.75" />
  </svg>
)

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" />
    <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
)

const StarIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

const StarFilledIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
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

const DotsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="5" cy="12" r="1.5" fill="currentColor" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    <circle cx="19" cy="12" r="1.5" fill="currentColor" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const CoinsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
    <path d="M18.09 10.37A6 6 0 1110.37 18.09" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 8h2.5M7 10h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const XSmallIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const FilterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3 6h18M7 12h10M11 18h2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
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
  <div className="animate-pulse rounded-[18px] border-[1.5px] border-[#e0d0c5] border-l-[3px] bg-[#fdf8f5] p-5 dark:border-white/9 dark:bg-[#1e1c19]">
    <div className="mb-3 flex gap-2">
      <div className="h-5 w-16 rounded-full bg-[#e8ddd6] dark:bg-white/10" />
      <div className="h-5 w-16 rounded-full bg-[#e8ddd6] dark:bg-white/10" />
    </div>
    <div className="mb-2 h-5 w-3/4 rounded-lg bg-[#e8ddd6] dark:bg-white/10" />
    <div className="mb-1 h-3 w-full rounded bg-[#e8ddd6] dark:bg-white/10" />
    <div className="mb-4 h-3 w-2/3 rounded bg-[#e8ddd6] dark:bg-white/10" />
    <div className="flex items-center justify-between border-t border-[#e8ddd6] pt-3 dark:border-white/8">
      <div className="h-4 w-20 rounded bg-[#e8ddd6] dark:bg-white/10" />
      <div className="h-7 w-24 rounded-lg bg-[#e8ddd6] dark:bg-white/10" />
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
            <div className="grid grid-cols-3 gap-4 max-[860px]:grid-cols-2 max-[540px]:grid-cols-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <TrackerCardSkeleton key={i} />
              ))}
            </div>
          </div>
          <AppFooter />
        </div>
      </main>
    </div>
    <BottomNav />
  </div>
)

// ── Stat card ─────────────────────────────────────────────────────────────

const ACCENT_COLORS = [
  { light: '#b84c2b', dark: '#e8816a' },
  { light: '#3b6cb7', dark: '#4a9eff' },
  { light: '#2d6a47', dark: '#3dbf82' },
  { light: '#c98000', dark: '#f0a832' },
]

const StatCard = ({
  label,
  value,
  helper,
  accent,
}: {
  label: string
  value: string | number
  helper: string
  accent: { light: string; dark: string }
}) => (
  <div className="group relative overflow-hidden rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] transition hover:-translate-y-0.5 hover:border-[rgba(184,76,43,0.20)] hover:shadow-[0_10px_40px_rgba(26,23,20,0.10)] dark:border-white/10 dark:bg-[#1c1a18] dark:hover:border-white/20">
    <div
      className="absolute inset-x-0 top-0 h-[2.5px]"
      style={{ background: `linear-gradient(90deg, transparent, ${accent.light}, transparent)` }}
    />
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
    <p className="mt-3 text-[12px] leading-normal text-[#6b5f58] dark:text-[#6b6560]">{helper}</p>
  </div>
)

// ── Verify & Earn banner ──────────────────────────────────────────────────

const VerifyEarnBanner = ({ onGo }: { onGo: () => void }) => (
  <div className="flex flex-wrap items-center justify-between gap-5 rounded-[20px] border-[1.5px] border-[rgba(196,154,44,0.2)] bg-[rgba(196,154,44,0.06)] p-6 dark:border-[rgba(196,154,44,0.18)] dark:bg-[rgba(196,154,44,0.05)]">
    <div className="flex items-start gap-4">
      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(196,154,44,0.12)] dark:bg-[rgba(196,154,44,0.1)]">
        <span className="text-[#c49a2c]"><CoinsIcon /></span>
      </div>

      <div>
        <h2 className="mb-1 font-['Playfair_Display',serif] text-[18px] font-black leading-[1.2] text-[#1a1714] dark:text-[#f2f0eb]">
          Earn coins by reviewing trackers
        </h2>
        <p className="max-w-100 text-[12.5px] leading-[1.55] text-[#6b5f58] dark:text-[#9b9a92]">
          Vote on community submissions, help keep knowledge accurate, and earn +50 coins every time you're in the majority.
        </p>

        <div className="mt-3 flex items-center gap-5">
          <div>
            <span className="font-['Playfair_Display',serif] text-[20px] font-black text-[#1a1714] dark:text-[#f2f0eb]">7</span>
            <span className="ml-1.5 font-['DM_Mono',monospace] text-[9px] uppercase tracking-widest text-[#9b9a92]">in queue</span>
          </div>
          <div className="h-5 w-px bg-[#e0d0c5] dark:bg-white/10" />
          <div>
            <span className="font-['Playfair_Display',serif] text-[20px] font-black text-[#c49a2c]">+50</span>
            <span className="ml-1.5 font-['DM_Mono',monospace] text-[9px] uppercase tracking-widest text-[#9b9a92]">coins / review</span>
          </div>
          <div className="h-5 w-px bg-[#e0d0c5] dark:bg-white/10" />
          <div>
            <span className="font-['Playfair_Display',serif] text-[20px] font-black text-[#1a1714] dark:text-[#f2f0eb]">87</span>
            <span className="ml-1.5 font-['DM_Mono',monospace] text-[9px] uppercase tracking-widest text-[#9b9a92]">active this week</span>
          </div>
        </div>
      </div>
    </div>

    <button
      type="button"
      onClick={onGo}
      className="inline-flex shrink-0 items-center gap-2 rounded-[10px] border-[1.5px] border-[rgba(196,154,44,0.35)] bg-[rgba(196,154,44,0.1)] px-5 py-2.5 text-[13px] font-bold text-[#c49a2c] transition hover:-translate-y-px hover:bg-[rgba(196,154,44,0.18)] hover:shadow-[0_8px_24px_rgba(196,154,44,0.15)] dark:border-[rgba(196,154,44,0.3)] dark:hover:bg-[rgba(196,154,44,0.15)] max-[560px]:w-full max-[560px]:justify-center"
    >
      Verify &amp; earn <ArrowRightIcon />
    </button>
  </div>
)

// ── Tracker card ──────────────────────────────────────────────────────────

const TrackerCard = ({ tracker, onClone }: { tracker: Tracker; onClone: (id: string) => void }) => (
  <div
    className={cn(
      'flex flex-col rounded-[18px] border-[1.5px] bg-[#fdf8f5] transition duration-200 dark:bg-[#1e1c19]',
      'border-[#e0d0c5] dark:border-white/9',
      'hover:shadow-[0_8px_32px_rgba(26,23,20,0.10)] hover:-translate-y-0.5 dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
      tracker.verified
        ? 'border-l-[3px] border-l-[rgba(45,106,71,0.5)] dark:border-l-[rgba(92,201,138,0.35)]'
        : 'border-l-[3px] border-l-[rgba(184,76,43,0.25)] dark:border-l-[rgba(232,129,106,0.18)]',
    )}
  >
    <div className="flex flex-1 flex-col p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center rounded-full border border-[#e0d0c5] bg-[rgba(26,23,20,0.04)] px-2.25 py-0.75 font-['DM_Mono',monospace] text-[8px] uppercase tracking-widest text-[#9b9a92] dark:border-white/9 dark:bg-white/4">
            Tracker
          </span>
          {tracker.verified ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(45,106,71,0.22)] bg-[rgba(45,106,71,0.08)] px-2.25 py-0.75 font-['DM_Mono',monospace] text-[8px] uppercase tracking-widest text-[#2d6a47] dark:text-[#5cc98a]">
              <VerifiedIcon /> Verified
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full border border-[#e0d0c5] bg-[rgba(26,23,20,0.04)] px-2.25 py-0.75 font-['DM_Mono',monospace] text-[8px] uppercase tracking-widest text-[#9b9a92] dark:border-white/9 dark:bg-white/4">
              Community
            </span>
          )}
        </div>
        <button
          type="button"
          aria-label="More options"
          className="flex h-6 w-6 items-center justify-center rounded-full text-[#9b9a92] transition hover:bg-[rgba(26,23,20,0.06)] dark:hover:bg-white/8"
        >
          <DotsIcon />
        </button>
      </div>

      <h3 className="mb-1.5 font-['Playfair_Display',serif] text-[15px] font-extrabold leading-tight text-[#1a1714] dark:text-[#f2f0eb]">
        {tracker.title}
      </h3>
      <p className="mb-auto text-[12px] leading-[1.55] text-[#6b5f58] dark:text-[#9b9a92]">
        {tracker.description}
      </p>

      <div className="mt-4 grid grid-cols-3 divide-x divide-[#e8ddd6] overflow-hidden rounded-[10px] border border-[#e8ddd6] dark:divide-white/8 dark:border-white/8">
        <div className="flex flex-col items-center px-2 py-2.5">
          <span className="mb-0.5 font-['DM_Mono',monospace] text-[8px] uppercase tracking-widest text-[#9b9a92]">Rating</span>
          <span className="flex items-center gap-1 font-['Playfair_Display',serif] text-[13px] font-extrabold text-[#c49a2c]">
            <StarIcon /> {tracker.rating.toFixed(1)}
          </span>
        </div>
        <div className="flex flex-col items-center px-2 py-2.5">
          <span className="mb-0.5 font-['DM_Mono',monospace] text-[8px] uppercase tracking-widest text-[#9b9a92]">Topic</span>
          <span className="max-w-full truncate font-['Playfair_Display',serif] text-[13px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
            {tracker.topic}
          </span>
        </div>
        <div className="flex flex-col items-center px-2 py-2.5">
          <span className="mb-0.5 font-['DM_Mono',monospace] text-[8px] uppercase tracking-widest text-[#9b9a92]">Clones</span>
          <span className="flex items-center gap-1 font-['Playfair_Display',serif] text-[13px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
            <CopyIcon />
            {tracker.clones >= 1000 ? `${(tracker.clones / 1000).toFixed(1)}k` : tracker.clones}
          </span>
        </div>
      </div>

      <div className="mt-3.5 flex items-center justify-between">
        <span className="font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-widest text-[#9b9a92]">
          {tracker.inDashboard ? 'Active · In progress' : 'Not started'}
        </span>
        {tracker.inDashboard ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(45,106,71,0.22)] bg-[rgba(45,106,71,0.07)] px-3.5 py-1.5 text-[12px] font-bold text-[#2d6a47] dark:text-[#5cc98a]">
            <CheckIcon /> In dashboard
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onClone(tracker._id)}
            className="inline-flex items-center gap-1.5 rounded-lg border-[1.5px] border-[rgba(184,76,43,0.22)] bg-transparent px-3.5 py-1.5 text-[12px] font-bold text-[#b84c2b] transition hover:border-[rgba(184,76,43,0.35)] hover:bg-[rgba(184,76,43,0.07)] dark:border-[rgba(232,129,106,0.25)] dark:text-[#e8816a]"
          >
            Clone tracker
          </button>
        )}
      </div>
    </div>
  </div>
)

// ── Mock data ─────────────────────────────────────────────────────────────

const TRACKERS: Tracker[] = [
  {
    _id: 't1',
    title: 'Microeconomics Mastery',
    description: 'Complete path for graduate entry level micro theory and competitive economics preparation.',
    rating: 4.9, clones: 1200, verified: true, inDashboard: false, topic: 'Economics',
  },
  {
    _id: 't2',
    title: 'Linear Algebra Deep-Dive',
    description: 'From basic vectors to spectral theorem with practical Python implementations.',
    rating: 4.2, clones: 840, verified: false, inDashboard: true, topic: 'CompSci',
  },
  {
    _id: 't3',
    title: 'Medieval History: Europe',
    description: 'The rise and fall of feudalism across the central European kingdoms.',
    rating: 4.5, clones: 312, verified: false, inDashboard: false, topic: 'History',
  },
  {
    _id: 't4',
    title: 'Modern Physics I',
    description: 'Special relativity and early quantum mechanics for undergrads.',
    rating: 5.0, clones: 2100, verified: true, inDashboard: false, topic: 'Science',
  },
  {
    _id: 't5',
    title: 'Advanced SEO 2024',
    description: 'Modern strategies for technical optimization and content hierarchy.',
    rating: 3.8, clones: 1800, verified: false, inDashboard: false, topic: 'CompSci',
  },
  {
    _id: 't6',
    title: 'French B1: Immersion',
    description: 'Reading and listening path focusing on contemporary literature.',
    rating: 4.7, clones: 540, verified: false, inDashboard: false, topic: 'Languages',
  },
]

const ALL_TOPICS = [
  'Economics', 'CompSci', 'Bio-Med', 'History',
  'Languages', 'Science', 'Mathematics', 'Philosophy',
  'Psychology', 'Engineering', 'Law', 'Medicine',
  'Arts', 'Literature', 'Business', 'Politics',
]

const PERSONAL_STATS = [
  { label: 'Your published', value: '3', helper: "Trackers you've shared" },
  { label: 'Clones received', value: '312', helper: 'Others copied your work' },
  { label: 'Cloned by you', value: '5', helper: 'In your dashboard' },
  { label: 'Avg rating', value: '4.6', helper: 'Across your publications' },
]

const RATING_OPTIONS = [
  { label: 'Any', value: null },
  { label: '3.5+', value: 3.5 },
  { label: '4.0+', value: 4.0 },
  { label: '4.5+', value: 4.5 },
]

// ── Topic Dropdown ────────────────────────────────────────────────────────

const TopicDropdown = ({
  selectedTopics,
  onChange,
  topicSearch,
  setTopicSearch,
  open,
  setOpen,
  dropdownRef,
}: {
  selectedTopics: string[]
  onChange: (topics: string[]) => void
  topicSearch: string
  setTopicSearch: (v: string) => void
  open: boolean
  setOpen: (v: boolean) => void
  dropdownRef: React.RefObject<HTMLDivElement | null>
}) => {
  const filtered = ALL_TOPICS.filter((t) =>
    t.toLowerCase().includes(topicSearch.toLowerCase()),
  )

  const toggle = (topic: string) => {
    onChange(
      selectedTopics.includes(topic)
        ? selectedTopics.filter((t) => t !== topic)
        : [...selectedTopics, topic],
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'inline-flex items-center gap-2 rounded-xl border-[1.5px] px-4 py-2.25 text-[13px] font-medium transition',
          selectedTopics.length > 0
            ? 'border-[rgba(184,76,43,0.35)] bg-[rgba(184,76,43,0.09)] text-[#b84c2b] dark:border-[rgba(232,129,106,0.35)] dark:text-[#e8816a]'
            : 'border-[#e0d0c5] bg-[#fdf8f5] text-[#6b5f58] hover:border-[rgba(184,76,43,0.22)] dark:border-white/9 dark:bg-[#1e1c19] dark:text-[#9b9a92]',
        )}
      >
        Topics
        {selectedTopics.length > 0 && (
          <span className="inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#b84c2b] px-1 font-['DM_Mono',monospace] text-[9px] font-bold text-white dark:bg-[#e8816a] dark:text-[#1a1714]">
            {selectedTopics.length}
          </span>
        )}
        <span className={cn('transition-transform duration-200', open && 'rotate-180')}>
          <ChevronDownIcon />
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-65 rounded-2xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] shadow-[0_12px_40px_rgba(26,23,20,0.12)] dark:border-white/10 dark:bg-[#1e1c19] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
          <div className="border-b border-[#e8ddd6] p-3 dark:border-white/8">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9b9a92]">
                <SearchIcon />
              </span>
              <input
                type="text"
                value={topicSearch}
                onChange={(e) => setTopicSearch(e.target.value)}
                placeholder="Search topics…"
                className="w-full rounded-[10px] border-[1.5px] border-[#e0d0c5] bg-white py-1.75 pl-8 pr-3 text-[12px] text-[#1a1714] outline-none placeholder:text-[#9b9a92] focus:border-[rgba(184,76,43,0.3)] dark:border-white/9 dark:bg-[#141412] dark:text-[#f2f0eb]"
              />
            </div>
          </div>

          <div className="max-h-55 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <p className="px-3 py-4 text-center text-[12px] text-[#9b9a92]">No topics found</p>
            ) : (
              filtered.map((topic) => {
                const active = selectedTopics.includes(topic)
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggle(topic)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-[10px] px-3 py-2.25 text-[13px] transition',
                      active
                        ? 'bg-[rgba(184,76,43,0.08)] text-[#b84c2b] dark:text-[#e8816a]'
                        : 'text-[#1a1714] hover:bg-[rgba(26,23,20,0.04)] dark:text-[#f2f0eb] dark:hover:bg-white/5',
                    )}
                  >
                    <span>{topic}</span>
                    {active && (
                      <span className="text-[#b84c2b] dark:text-[#e8816a]">
                        <CheckIcon />
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </div>

          {selectedTopics.length > 0 && (
            <div className="border-t border-[#e8ddd6] p-2 dark:border-white/8">
              <button
                type="button"
                onClick={() => { onChange([]); setTopicSearch('') }}
                className="w-full rounded-[10px] py-2 text-[12px] font-medium text-[#9b9a92] transition hover:bg-[rgba(26,23,20,0.04)] dark:hover:bg-white/5"
              >
                Clear all topics
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Filter Panel ──────────────────────────────────────────────────────────

const FilterPanel = ({
  open,
  minRating,
  setMinRating,
  verifiedOnly,
  setVerifiedOnly,
  onClearAll,
}: {
  open: boolean
  minRating: number | null
  setMinRating: (v: number | null) => void
  verifiedOnly: boolean
  setVerifiedOnly: (v: boolean) => void
  onClearAll: () => void
}) => {
  if (!open) return null

  return (
    <div className="rounded-2xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-4 dark:border-white/9 dark:bg-[#1e1c19]">
      <div className="flex flex-wrap gap-x-8 gap-y-4">
        {/* Rating */}
        <div>
          <p className="mb-2.5 font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.12em] text-[#9b9a92]">
            Min rating
          </p>
          <div className="flex flex-wrap gap-2">
            {RATING_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => setMinRating(opt.value)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.25 text-[12px] font-medium transition',
                  minRating === opt.value
                    ? 'border-[rgba(196,154,44,0.4)] bg-[rgba(196,154,44,0.12)] text-[#c49a2c]'
                    : 'border-[#e0d0c5] bg-white text-[#6b5f58] hover:border-[rgba(184,76,43,0.2)] dark:border-white/9 dark:bg-transparent dark:text-[#9b9a92]',
                )}
              >
                {opt.value !== null && (
                  <span className="text-[#c49a2c]"><StarFilledIcon /></span>
                )}
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="hidden w-px self-stretch bg-[#e8ddd6] dark:bg-white/8 sm:block" />

        {/* Status */}
        <div>
          <p className="mb-2.5 font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.12em] text-[#9b9a92]">
            Status
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setVerifiedOnly(false)}
              className={cn(
                'rounded-full border px-3 py-1.25 text-[12px] font-medium transition',
                !verifiedOnly
                  ? 'border-[rgba(184,76,43,0.35)] bg-[rgba(184,76,43,0.09)] text-[#b84c2b] dark:text-[#e8816a]'
                  : 'border-[#e0d0c5] bg-white text-[#6b5f58] hover:border-[rgba(184,76,43,0.2)] dark:border-white/9 dark:bg-transparent dark:text-[#9b9a92]',
              )}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setVerifiedOnly(true)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.25 text-[12px] font-medium transition',
                verifiedOnly
                  ? 'border-[rgba(45,106,71,0.35)] bg-[rgba(45,106,71,0.09)] text-[#2d6a47] dark:text-[#5cc98a]'
                  : 'border-[#e0d0c5] bg-white text-[#6b5f58] hover:border-[rgba(184,76,43,0.2)] dark:border-white/9 dark:bg-transparent dark:text-[#9b9a92]',
              )}
            >
              <VerifiedIcon /> Verified only
            </button>
          </div>
        </div>

        {/* Clear */}
        <div className="flex items-end ml-auto">
          <button
            type="button"
            onClick={onClearAll}
            className="text-[12px] text-[#9b9a92] underline underline-offset-2 transition hover:text-[#b84c2b] dark:hover:text-[#e8816a]"
          >
            Clear all
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function CommunityBrowsePage() {
  const navigate = useNavigate()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem('imminiq_sb') === 'closed',
  )

  const [search, setSearch] = useState('')
  const [topicSearch, setTopicSearch] = useState('')
  const [topicDropdownOpen, setTopicDropdownOpen] = useState(false)
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [minRating, setMinRating] = useState<number | null>(null)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)

  const topicDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (topicDropdownRef.current && !topicDropdownRef.current.contains(e.target as Node)) {
        setTopicDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const dashboardSummaryQuery = {
    data: {
      user: { fullName: 'Arjun Reddy', avatarUrl: null, isPremium: false },
      streak: { current: 7 },
    } as DashboardSummaryData,
    isLoading: false,
    isError: false,
  }

  const dashboardSummary = dashboardSummaryQuery.data
  const isInitialLoad = dashboardSummaryQuery.isLoading && !dashboardSummary
  const hasError = dashboardSummaryQuery.isError

  const activeFilterCount =
    selectedTopics.length + (minRating !== null ? 1 : 0) + (verifiedOnly ? 1 : 0)

  const isAnyFilterActive = !!(search || selectedTopics.length > 0 || minRating !== null || verifiedOnly)

  const filteredTrackers = TRACKERS.filter((tracker) => {
    const matchTopic = selectedTopics.length === 0 || selectedTopics.includes(tracker.topic)
    const loweredSearch = search.toLowerCase()
    const matchSearch =
      !search ||
      tracker.title.toLowerCase().includes(loweredSearch) ||
      tracker.description.toLowerCase().includes(loweredSearch)
    const matchRating = minRating === null || tracker.rating >= minRating
    const matchVerified = !verifiedOnly || tracker.verified
    return matchTopic && matchSearch && matchRating && matchVerified
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

  const clearAllFilters = () => {
    setSearch('')
    setSelectedTopics([])
    setTopicSearch('')
    setMinRating(null)
    setVerifiedOnly(false)
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
            Something went wrong loading community data.
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

        <main
          className={cn(
            'flex min-w-0 flex-1 flex-col overflow-x-clip transition-[margin] duration-300',
            sidebarCollapsed ? 'min-[901px]:ml-0' : 'min-[901px]:ml-56',
          )}
        >
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

              {/* ── Header ── */}
              <section className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-3 py-1 font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.12em] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#4caf7d] dark:bg-[#5cc98a]" />
                    Community
                  </div>
                  <h1 className="font-['Playfair_Display',serif] text-[clamp(26px,3.5vw,38px)] font-extrabold leading-[1.15] tracking-[-0.8px] text-[#1a1714] dark:text-[#f2f0eb]">
                    Exchange your <span className="text-[#b84c2b] dark:text-[#e8816a]">knowledge</span>
                  </h1>
                  <p className="mt-2 max-w-125 text-[13px] italic leading-[1.55] text-[#6b5f58] opacity-80 dark:text-[#9b9a92]">
                    Join the collective effort to curate the finest academic paths.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/community/my-publications')}
                  className="inline-flex items-center gap-2 rounded-[10px] border-[1.5px] border-[rgba(184,76,43,0.22)] bg-[rgba(184,76,43,0.07)] px-5 py-2.5 text-[13px] font-bold text-[#b84c2b] transition hover:-translate-y-px hover:border-[rgba(184,76,43,0.35)] hover:bg-[rgba(184,76,43,0.12)] dark:border-[rgba(232,129,106,0.25)] dark:bg-[rgba(232,129,106,0.08)] dark:text-[#e8816a] max-[560px]:w-full max-[560px]:justify-center"
                >
                  <BookOpenIcon />
                  My publications
                  <span className="ml-0.5 inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#b84c2b] px-1 font-['DM_Mono',monospace] text-[9px] font-bold text-white dark:bg-[#e8816a] dark:text-[#1a1714]">
                    3
                  </span>
                </button>
              </section>

              {/* ── Stats ── */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {PERSONAL_STATS.map((card, index) => (
                  <StatCard key={card.label} {...card} accent={ACCENT_COLORS[index]} />
                ))}
              </div>

         {/* ── Verify & earn banner ── */}
              <VerifyEarnBanner onGo={() => navigate('/verify-and-earn')} />
             

              {/* ── Search + filters ── */}
              <div className="flex flex-col gap-3">

                {/* Row 1: search + topic dropdown + filter toggle */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Search */}
                  <div className="relative min-w-50 flex-1 max-w-105">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9b9a92]">
                      <SearchIcon />
                    </span>
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search trackers…"
                      className="w-full rounded-xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] py-2.25 pl-9 pr-4 text-[13px] text-[#1a1714] outline-none placeholder:text-[#9b9a92] focus:border-[rgba(184,76,43,0.3)] dark:border-white/9 dark:bg-[#1e1c19] dark:text-[#f2f0eb]"
                    />
                  </div>

                  {/* Topic dropdown */}
                  <TopicDropdown
                    selectedTopics={selectedTopics}
                    onChange={setSelectedTopics}
                    topicSearch={topicSearch}
                    setTopicSearch={setTopicSearch}
                    open={topicDropdownOpen}
                    setOpen={setTopicDropdownOpen}
                    dropdownRef={topicDropdownRef}
                  />

                  {/* Filter toggle */}
                  <button
                    type="button"
                    onClick={() => setFilterPanelOpen((v) => !v)}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-xl border-[1.5px] px-4 py-2.25 text-[13px] font-medium transition',
                      filterPanelOpen || activeFilterCount > 0
                        ? 'border-[rgba(184,76,43,0.35)] bg-[rgba(184,76,43,0.09)] text-[#b84c2b] dark:border-[rgba(232,129,106,0.35)] dark:text-[#e8816a]'
                        : 'border-[#e0d0c5] bg-[#fdf8f5] text-[#6b5f58] hover:border-[rgba(184,76,43,0.22)] dark:border-white/9 dark:bg-[#1e1c19] dark:text-[#9b9a92]',
                    )}
                  >
                    <FilterIcon />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#b84c2b] px-1 font-['DM_Mono',monospace] text-[9px] font-bold text-white dark:bg-[#e8816a] dark:text-[#1a1714]">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>

                  {/* Results + clear — right aligned */}
                  {isAnyFilterActive && (
                    <div className="ml-auto flex items-center gap-3">
                      <span className="font-['DM_Mono',monospace] text-[10px] uppercase tracking-widest text-[#9b9a92]">
                        {filteredTrackers.length} result{filteredTrackers.length !== 1 ? 's' : ''}
                      </span>
                      <button
                        type="button"
                        onClick={clearAllFilters}
                        className="text-[12px] text-[#9b9a92] underline underline-offset-2 transition hover:text-[#b84c2b] dark:hover:text-[#e8816a]"
                      >
                        Clear all
                      </button>
                    </div>
                  )}
                </div>

                {/* Row 2: active topic chips */}
                {selectedTopics.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedTopics.map((topic) => (
                      <span
                        key={topic}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(184,76,43,0.22)] bg-[rgba(184,76,43,0.08)] px-3 py-1 font-['DM_Mono',monospace] text-[11px] text-[#b84c2b] dark:border-[rgba(232,129,106,0.25)] dark:text-[#e8816a]"
                      >
                        {topic}
                        <button
                          type="button"
                          aria-label={`Remove ${topic}`}
                          onClick={() => setSelectedTopics((prev) => prev.filter((t) => t !== topic))}
                          className="opacity-60 transition hover:opacity-100"
                        >
                          <XSmallIcon />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Row 3: filter panel */}
                <FilterPanel
                  open={filterPanelOpen}
                  minRating={minRating}
                  setMinRating={setMinRating}
                  verifiedOnly={verifiedOnly}
                  setVerifiedOnly={setVerifiedOnly}
                  onClearAll={() => {
                    setMinRating(null)
                    setVerifiedOnly(false)
                  }}
                />
              </div>

              {/* ── Tracker grid ── */}
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
                  <p className="font-['Playfair_Display',serif] text-[18px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
                    No trackers found
                  </p>
                  <p className="mt-2 text-[13px] text-[#9b9a92]">Try adjusting your filters or search term.</p>
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg border-[1.5px] border-[rgba(184,76,43,0.22)] bg-transparent px-4 py-2 text-[12px] font-bold text-[#b84c2b] transition hover:bg-[rgba(184,76,43,0.07)] dark:border-[rgba(232,129,106,0.25)] dark:text-[#e8816a]"
                  >
                    Clear all filters
                  </button>
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