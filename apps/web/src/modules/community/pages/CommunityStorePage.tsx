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

const numFmt = (n: number): string =>
  n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : n.toString()

// ── Types ─────────────────────────────────────────────────────────────────

type StoreTab = 'all' | 'boosts' | 'premium' | 'scholar' | 'cosmetic'

interface StoreItem {
  id: string
  title: string
  cat: string
  tab: StoreTab
  icon: string
  cost: number
  owned: boolean
  limited: boolean
  popular: boolean
  isNew: boolean
  desc: string
  progress: number | null
}

interface CoinHistoryEntry {
  id: string
  label: string
  sub: string
  amount: number
  type: 'earn' | 'spend'
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

const CoinsIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
    <path d="M18.09 10.37A6 6 0 1110.37 18.09" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 8h2.5M7 10h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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


const BulbIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M9 18h6M12 2a7 7 0 017 7c0 2.5-1.3 4.7-3.3 6H8.3A7 7 0 015 9a7 7 0 017-7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M9 18v2a1 1 0 001 1h4a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
    aria-label="Loading store"
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
            <SkeletonBlock className="h-5 w-24 rounded-full" />
            <SkeletonBlock className="h-9 w-[min(420px,100%)] rounded-2xl" />
            <div className="grid grid-cols-4 gap-3 max-[860px]:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-30 animate-pulse rounded-2xl bg-[#e8ddd6] dark:bg-white/10" />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4 max-[860px]:grid-cols-2 max-[540px]:grid-cols-1">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-55 animate-pulse rounded-[18px] bg-[#e8ddd6] dark:bg-white/10" />
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

const STAT_ACCENTS = {
  amber: { light: '#c49a2c', dark: '#f0a832' },
  rust:  { light: '#b84c2b', dark: '#e8816a' },
  green: { light: '#2d6a47', dark: '#3dbf82' },
  purple:{ light: '#6b46c1', dark: '#a78bfa' },
} as const

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
  <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] transition hover:-translate-y-0.5 hover:border-[rgba(184,76,43,0.20)] hover:shadow-[0_10px_40px_rgba(26,23,20,0.10)] dark:border-white/10 dark:bg-[#1c1a18] dark:hover:border-white/20">
    <div
      className="absolute inset-x-0 top-0 h-[2.5px] dark:hidden"
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
    <p className="mt-3 flex-1 text-[12px] leading-normal text-[#6b5f58] dark:text-[#6b6560]">{helper}</p>
    {action && <div className="mt-3">{action}</div>}
  </div>
)

// ── Progress bar ──────────────────────────────────────────────────────────

const ProgressBar = ({ value, color = '#c49a2c' }: { value: number; color?: string }) => (
  <div className="h-0.75 rounded-full bg-[rgba(26,23,20,0.08)] dark:bg-white/10">
    <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, background: color }} />
  </div>
)

// ── Store item card ───────────────────────────────────────────────────────

const VISUAL_BG: Record<StoreTab, string> = {
  all:      'rgba(26,23,20,0.03)',
  boosts:   'rgba(196,154,44,0.07)',
  premium:  'rgba(107,70,193,0.07)',
  scholar:  'rgba(45,106,71,0.07)',
  cosmetic: 'rgba(184,76,43,0.07)',
}

const VISUAL_BG_DARK: Record<StoreTab, string> = {
  all:      'rgba(255,255,255,0.03)',
  boosts:   'rgba(240,168,50,0.07)',
  premium:  'rgba(167,139,250,0.07)',
  scholar:  'rgba(61,191,130,0.07)',
  cosmetic: 'rgba(232,129,106,0.07)',
}

type BadgeVariant = 'amber' | 'rust' | 'purple' | 'green'

const BADGE_STYLES: Record<BadgeVariant, string> = {
  amber:  'border-[rgba(196,154,44,0.3)] bg-[rgba(196,154,44,0.09)] text-[#7c5a1e] dark:text-[#c49a2c]',
  rust:   'border-[rgba(184,76,43,0.3)] bg-[rgba(184,76,43,0.09)] text-[#b84c2b] dark:text-[#e8816a]',
  purple: 'border-[rgba(107,70,193,0.3)] bg-[rgba(107,70,193,0.09)] text-[#6b46c1] dark:text-[#a78bfa]',
  green:  'border-[rgba(45,106,71,0.3)] bg-[rgba(45,106,71,0.09)] text-[#2d6a47] dark:text-[#5cc98a]',
}

const ItemBadge = ({ label, variant }: { label: string; variant: BadgeVariant }) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full border px-2 py-[2.5px] font-[\'DM_Mono\',monospace] text-[7.5px] uppercase tracking-widest font-bold',
      BADGE_STYLES[variant],
    )}
  >
    {label}
  </span>
)

const StoreItemCard = ({
  item,
  balance,
  onRedeem,
}: {
  item: StoreItem
  balance: number
  onRedeem: (item: StoreItem) => void
}) => {
  const canAfford = balance >= item.cost
  const shortfall = item.cost - balance

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-[18px] border-[1.5px] bg-[#fdf8f5] transition-all duration-200 dark:bg-[#1e1c19]',
        'hover:shadow-[0_8px_32px_rgba(26,23,20,0.10)] hover:-translate-y-0.5 dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
        item.popular
          ? 'border-[rgba(196,154,44,0.3)] dark:border-[rgba(240,168,50,0.25)]'
          : 'border-[#e0d0c5] border-l-[3px] border-l-[rgba(184,76,43,0.25)] hover:border-l-[rgba(184,76,43,0.45)] dark:border-white/9 dark:border-l-[rgba(232,129,106,0.22)]',
      )}
    >
      {/* Badge row */}
      <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5">
        {item.isNew    && <ItemBadge label="New"     variant="rust"   />}
        {item.popular  && <ItemBadge label="Popular" variant="amber"  />}
        {item.limited  && <ItemBadge label="Limited" variant="purple" />}
        {item.owned    && <ItemBadge label="Owned"   variant="green"  />}
      </div>

      {/* Visual area */}
      <div
        className="flex h-24 items-center justify-center text-[40px] dark:hidden"
        style={{ background: VISUAL_BG[item.tab] }}
      >
        {item.icon}
      </div>
      <div
        className="hidden h-24 items-center justify-center text-[40px] dark:flex"
        style={{ background: VISUAL_BG_DARK[item.tab] }}
      >
        {item.icon}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4 gap-0">
        <div className="mb-1.5 font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-widest text-[#9b9a92]">
          {item.cat}
        </div>
        <h3 className="mb-1.5 font-['Playfair_Display',serif] text-[14.5px] font-extrabold leading-tight text-[#1a1714] dark:text-[#f2f0eb]">
          {item.title}
        </h3>
        <p className="mb-3 flex-1 text-[12px] leading-normal text-[#6b5f58] dark:text-[#9b9a92]">
          {item.desc}
        </p>

        {/* Claim progress (for limited items) */}
        {item.progress !== null && (
          <div className="mb-3">
            <ProgressBar value={item.progress} />
            <div className="mt-1.5 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.08em] text-[#9b9a92]">
              {item.progress}% claimed
            </div>
          </div>
        )}

        {/* Stats row */}
        <div className="mb-3 grid grid-cols-2 divide-x divide-[#e8ddd6] overflow-hidden rounded-[10px] border border-[#e8ddd6] dark:divide-white/8 dark:border-white/8">
          <div className="flex flex-col items-center py-2">
            <span className="font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-widest text-[#9b9a92] mb-0.5">Cost</span>
            <span className="flex items-center gap-1 font-['Playfair_Display',serif] text-[13px] font-extrabold text-[#c49a2c]">
              <CoinsIcon size={11} /> {numFmt(item.cost)}
            </span>
          </div>
          <div className="flex flex-col items-center py-2">
            <span className="font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-widest text-[#9b9a92] mb-0.5">Type</span>
            <span className="font-['Playfair_Display',serif] text-[13px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
              {item.cat.split(' ')[0]}
            </span>
          </div>
        </div>

        {/* CTA */}
        {item.owned ? (
          <div className="flex items-center gap-2 mt-auto">
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2d6a47] text-white dark:bg-[#3dbf82]">
              <CheckIcon />
            </span>
            <div>
              <div className="text-[11.5px] font-bold text-[#2d6a47] dark:text-[#5cc98a]">In your collection</div>
              <div className="text-[10px] text-[#9b9a92]">Already redeemed</div>
            </div>
          </div>
        ) : (
          <div className="mt-auto flex items-center justify-between gap-2">
            {!canAfford ? (
              <span className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-widest text-[#9b9a92] leading-tight">
                Need {numFmt(shortfall)} more
              </span>
            ) : (
              <span className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-widest text-[#9b9a92] leading-tight">
                Ready to redeem
              </span>
            )}
            <button
              type="button"
              onClick={() => onRedeem(item)}
              disabled={!canAfford}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-lg border-[1.5px] px-3 py-1.25 text-[11.5px] font-bold transition',
                canAfford
                  ? 'border-[rgba(184,76,43,0.22)] text-[#b84c2b] hover:border-[rgba(184,76,43,0.4)] hover:bg-[rgba(184,76,43,0.07)] dark:border-[rgba(232,129,106,0.25)] dark:text-[#e8816a] dark:hover:bg-[rgba(232,129,106,0.08)]'
                  : 'border-[#e0d0c5] text-[#9b9a92] cursor-not-allowed dark:border-white/9',
              )}
            >
              <CoinsIcon size={11} />
              Redeem
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Redeem confirmation modal ─────────────────────────────────────────────

const RedeemModal = ({
  item,
  balance,
  onConfirm,
  onClose,
}: {
  item: StoreItem
  balance: number
  onConfirm: () => void
  onClose: () => void
}) => {
  const after = balance - item.cost

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(26,23,20,0.55)] px-4 dark:bg-[rgba(0,0,0,0.65)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-100 rounded-[22px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-7 dark:border-white/10 dark:bg-[#1e1c19]">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-[#9b9a92] transition hover:bg-[rgba(26,23,20,0.06)] dark:hover:bg-white/8"
        >
          <XIcon />
        </button>

        {/* Header */}
        <div className="mb-1 font-['Playfair_Display',serif] text-[20px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]" id="modal-title">
          Confirm redemption
        </div>
        <p className="mb-5 text-[13px] text-[#6b5f58] dark:text-[#9b9a92]">
          This will deduct coins from your balance.
        </p>

        {/* Item preview */}
        <div className="mb-5 flex items-center gap-3 rounded-[14px] border-[1.5px] border-[#e0d0c5] bg-[#f5ede4] p-4 dark:border-white/9 dark:bg-[#141412]">
          <span className="text-[28px]">{item.icon}</span>
          <div className="min-w-0">
            <div className="font-['Playfair_Display',serif] text-[14px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb] truncate">
              {item.title}
            </div>
            <div className="mt-0.5 flex items-center gap-1 font-['DM_Mono',monospace] text-[10px] text-[#c49a2c]">
              <CoinsIcon size={10} /> {numFmt(item.cost)} coins
            </div>
          </div>
        </div>

        {/* Balance breakdown */}
        <div className="mb-5 grid grid-cols-2 divide-x divide-[#e8ddd6] overflow-hidden rounded-xl border border-[#e8ddd6] dark:divide-white/8 dark:border-white/8">
          <div className="flex flex-col items-center py-3">
            <span className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-widest text-[#9b9a92] mb-1">Current balance</span>
            <span className="flex items-center gap-1 font-['Playfair_Display',serif] text-[18px] font-black text-[#1a1714] dark:text-[#f2f0eb]">
              <CoinsIcon size={13} /> {numFmt(balance)}
            </span>
          </div>
          <div className="flex flex-col items-center py-3">
            <span className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-widest text-[#9b9a92] mb-1">After redemption</span>
            <span
              className={cn(
                'flex items-center gap-1 font-[\'Playfair_Display\',serif] text-[18px] font-black',
                after < 0 ? 'text-[#b84c2b] dark:text-[#e8816a]' : 'text-[#2d6a47] dark:text-[#3dbf82]',
              )}
            >
              <CoinsIcon size={13} /> {numFmt(Math.max(0, after))}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-[10px] border-[1.5px] border-[#e0d0c5] bg-transparent py-2.5 text-[13px] font-bold text-[#6b5f58] transition hover:bg-[rgba(26,23,20,0.04)] dark:border-white/9 dark:text-[#9b9a92]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-[rgba(184,76,43,0.25)] bg-[rgba(184,76,43,0.09)] py-2.5 text-[13px] font-bold text-[#b84c2b] transition hover:border-[rgba(184,76,43,0.4)] hover:bg-[rgba(184,76,43,0.14)] dark:border-[rgba(232,129,106,0.3)] dark:text-[#e8816a]"
          >
            <CoinsIcon size={13} /> Redeem now
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Toast ─────────────────────────────────────────────────────────────────

const Toast = ({ message, visible }: { message: string; visible: boolean }) => (
  <div
    className={cn(
      'pointer-events-none fixed bottom-6 left-1/2 z-60 -translate-x-1/2 flex items-center gap-2.5 rounded-xl border-[1.5px] border-[rgba(45,106,71,0.3)] bg-[#fdf8f5] px-5 py-3 text-[13px] font-bold text-[#2d6a47] shadow-[0_4px_24px_rgba(0,0,0,0.12)] transition-all duration-300 dark:border-[rgba(61,191,130,0.3)] dark:bg-[#1e1c19] dark:text-[#3dbf82]',
      visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
    )}
    role="status"
    aria-live="polite"
  >
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2d6a47] text-white dark:bg-[#3dbf82] dark:text-[#141412]">
      <CheckIcon />
    </span>
    {message}
  </div>
)

// ── Mock data ─────────────────────────────────────────────────────────────

const INITIAL_ITEMS: StoreItem[] = [
  {
    id: 's1', title: 'Tracker Spotlight', cat: 'Tracker boosts', tab: 'boosts',
    icon: '🔦', cost: 300, owned: false, limited: false, popular: true, isNew: false,
    desc: 'Feature your tracker on the community browse page for 48 hours. Gain visibility and earn more clones.',
    progress: 72,
  },
  {
    id: 's2', title: 'Priority Review Badge', cat: 'Tracker boosts', tab: 'boosts',
    icon: '⚡', cost: 500, owned: false, limited: true, popular: false, isNew: false,
    desc: 'Mark your submissions as priority for faster verification queue processing.',
    progress: 45,
  },
  {
    id: 's3', title: 'Dark Scholar Theme', cat: 'Cosmetics', tab: 'cosmetic',
    icon: '🌑', cost: 200, owned: true, limited: false, popular: false, isNew: false,
    desc: 'An elegant pitch-black variant of the Imminiq interface with bone-white typography.',
    progress: null,
  },
  {
    id: 's4', title: 'Imminiq Pro — 1 Month', cat: 'Premium features', tab: 'premium',
    icon: '✦', cost: 1200, owned: false, limited: false, popular: false, isNew: false,
    desc: 'Unlock unlimited mock tests, AI evaluation, and full analytics dashboards for 30 days.',
    progress: null,
  },
  {
    id: 's5', title: 'Tracker Boost × 3', cat: 'Tracker boosts', tab: 'boosts',
    icon: '🚀', cost: 600, owned: true, limited: false, popular: false, isNew: false,
    desc: 'Three single-use boosts. Apply to any tracker to push it to the top of browse results.',
    progress: null,
  },
  {
    id: 's6', title: 'Scholar Certificate', cat: 'Scholar perks', tab: 'scholar',
    icon: '🎓', cost: 800, owned: false, limited: false, popular: false, isNew: true,
    desc: 'A verifiable achievement certificate for completing any tracker with a 90%+ score.',
    progress: null,
  },
  {
    id: 's7', title: 'AI Mentor Session', cat: 'Scholar perks', tab: 'scholar',
    icon: '🧠', cost: 400, owned: false, limited: true, popular: false, isNew: true,
    desc: 'One 30-minute focused AI deep-dive on any topic from your active trackers. Limited slots.',
    progress: 58,
  },
  {
    id: 's8', title: 'Custom Profile Accent', cat: 'Cosmetics', tab: 'cosmetic',
    icon: '🎨', cost: 150, owned: false, limited: false, popular: false, isNew: false,
    desc: 'Choose a custom accent colour for your community profile and published trackers.',
    progress: null,
  },
]

const COIN_HISTORY: CoinHistoryEntry[] = [
  { id: 'h1', label: 'Review bonus',  sub: 'Post-War Recovery Models',     amount: 50,  type: 'earn'  },
  { id: 'h2', label: 'Redeemed perk', sub: 'Dark Scholar Theme',            amount: 200, type: 'spend' },
  { id: 'h3', label: 'Review bonus',  sub: 'Stellar Nucleosynthesis',       amount: 50,  type: 'earn'  },
  { id: 'h4', label: 'Streak reward', sub: '7-day streak milestone',        amount: 100, type: 'earn'  },
  { id: 'h5', label: 'Redeemed perk', sub: 'Tracker Boost × 3',             amount: 600, type: 'spend' },
]

const EARN_WAYS = [
  { step: '01', text: 'Review a tracker and vote with the majority', reward: '+50 coins'  },
  { step: '02', text: 'Maintain a 7-day consecutive learning streak', reward: '+100 coins' },
  { step: '03', text: 'Publish a tracker that earns 10+ clones',     reward: '+200 coins' },
  { step: '04', text: 'Reach a new rank on the Verify leaderboard',  reward: '+500 coins' },
]

const TABS: { id: StoreTab; label: string }[] = [
  { id: 'all',      label: 'All items'        },
  { id: 'boosts',   label: 'Tracker boosts'   },
  { id: 'premium',  label: 'Premium features' },
  { id: 'scholar',  label: 'Scholar perks'    },
  { id: 'cosmetic', label: 'Cosmetics'        },
]

// ── Page ──────────────────────────────────────────────────────────────────

export default function StorePage() {
  const navigate = useNavigate()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem('imminiq_sb') === 'closed',
  )

  const [items, setItems]           = useState<StoreItem[]>(INITIAL_ITEMS)
  const [activeTab, setActiveTab]   = useState<StoreTab>('all')
  const [balance, setBalance]       = useState(2400)
  const [totalSpent, setTotalSpent] = useState(800)
  const [pendingItem, setPendingItem] = useState<StoreItem | null>(null)
  const [toast, setToast]           = useState({ visible: false, message: '' })

  const dashboardSummaryQuery = {
    data: {
      user: { fullName: 'Arjun Reddy', avatarUrl: null, isPremium: false },
      streak: { current: 7 },
    } as DashboardSummaryData,
    isLoading: false,
    isError: false,
  }

  const dashboardSummary = dashboardSummaryQuery.data
  const isInitialLoad    = dashboardSummaryQuery.isLoading && !dashboardSummary
  const hasError         = dashboardSummaryQuery.isError

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

  const filteredItems = activeTab === 'all'
    ? items
    : items.filter((it) => it.tab === activeTab)

  const ownedCount = items.filter((it) => it.owned).length

  const showToast = (message: string) => {
    setToast({ visible: true, message })
    setTimeout(() => setToast({ visible: false, message: '' }), 2800)
  }

  const handleRedeem = (item: StoreItem) => {
    if (balance < item.cost) return
    setPendingItem(item)
  }

  const handleConfirmRedeem = () => {
    if (!pendingItem) return
    setBalance((b) => b - pendingItem.cost)
    setTotalSpent((s) => s + pendingItem.cost)
    setItems((prev) =>
      prev.map((it) => it.id === pendingItem.id ? { ...it, owned: true } : it),
    )
    showToast(`${pendingItem.title} redeemed!`)
    setPendingItem(null)
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
            Store unavailable
          </h1>
          <p className="mt-2 text-[13px] leading-[1.6] text-[#6b5f58] dark:text-[#9b9a92]">
            Something went wrong loading the store.
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
                    Imminiq Store
                  </div>
                  <h1 className="font-['Playfair_Display',serif] text-[clamp(26px,3.5vw,38px)] font-extrabold leading-[1.15] tracking-[-0.8px] text-[#1a1714] dark:text-[#f2f0eb]">
                    Spend your coins · <span className="text-[#c49a2c]">unlock perks</span>
                  </h1>
                  <p className="mt-2 max-w-125 text-[13px] italic leading-[1.55] text-[#6b5f58] opacity-80 dark:text-[#9b9a92]">
                    Redeem coins for tracker boosts, premium access, and scholar rewards.
                  </p>
                </div>

                {/* Balance callout */}
                <div className="flex items-center gap-5 rounded-[14px] border-[1.5px] border-[rgba(196,154,44,0.18)] bg-[rgba(196,154,44,0.05)] px-5 py-3.5 dark:border-[rgba(196,154,44,0.15)] dark:bg-[rgba(196,154,44,0.04)]">
                  <div className="text-center">
                    <div className="font-['Playfair_Display',serif] text-[26px] font-black text-[#1a1714] dark:text-[#f2f0eb] leading-none">
                      {numFmt(balance)}
                    </div>
                    <div className="font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-widest text-[#9b9a92] mt-1">Balance</div>
                  </div>
                  <div className="h-7 w-px bg-[rgba(196,154,44,0.18)]" />
                  <div className="text-center">
                    <div className="font-['Playfair_Display',serif] text-[26px] font-black text-[#c49a2c] leading-none">
                      {numFmt(totalSpent)}
                    </div>
                    <div className="font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-widest text-[#9b9a92] mt-1">Spent</div>
                  </div>
                </div>
              </section>

              {/* ── Stat cards — 4-col ── */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard
                  label="Coin balance"
                  value={numFmt(balance)}
                  helper="Coins available to spend"
                  accent={STAT_ACCENTS.amber}
                />
                <StatCard
                  label="Total earned"
                  value="3.2k"
                  helper="From reviews and streaks"
                  accent={STAT_ACCENTS.rust}
                />
                <StatCard
                  label="Total spent"
                  value={numFmt(totalSpent)}
                  helper="Redeemed in the store"
                  accent={STAT_ACCENTS.green}
                />
                <StatCard
                  label="Items owned"
                  value={ownedCount}
                  helper="Perks in your collection"
                  accent={STAT_ACCENTS.purple}
                  action={
                    <button
                      type="button"
                      onClick={() => navigate('/community/verify')}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-[rgba(107,70,193,0.28)] bg-[rgba(107,70,193,0.07)] px-3 py-1.5 font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.08em] font-bold text-[#6b46c1] transition hover:border-[rgba(107,70,193,0.45)] hover:bg-[rgba(107,70,193,0.13)] dark:border-[rgba(167,139,250,0.3)] dark:bg-[rgba(167,139,250,0.08)] dark:text-[#a78bfa] dark:hover:bg-[rgba(167,139,250,0.15)]"
                    >
                      <CoinsIcon size={11} /> Earn more <ArrowRightIcon />
                    </button>
                  }
                />
              </div>

              {/* ── Tabs ── */}
              <div className="flex flex-wrap items-center gap-2">
                {TABS.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={cn(
                      'rounded-full border-[1.5px] px-4 py-1.75 font-[\'DM_Mono\',monospace] text-[10px] uppercase tracking-widest transition',
                      activeTab === id
                        ? 'border-[rgba(184,76,43,0.35)] bg-[rgba(184,76,43,0.09)] text-[#b84c2b] dark:border-[rgba(232,129,106,0.35)] dark:text-[#e8816a]'
                        : 'border-[#e0d0c5] bg-[#fdf8f5] text-[#6b5f58] hover:border-[rgba(184,76,43,0.22)] dark:border-white/9 dark:bg-[#1e1c19] dark:text-[#9b9a92]',
                    )}
                  >
                    {label}
                    {id !== 'all' && (
                      <span className="ml-1.5 opacity-60">
                        ({items.filter((it) => it.tab === id).length})
                      </span>
                    )}
                  </button>
                ))}
                <span className="ml-auto font-['DM_Mono',monospace] text-[10px] uppercase tracking-widest text-[#9b9a92]">
                  {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* ── Main grid + sidebar ── */}
              <div className="flex gap-6 items-start max-[860px]:flex-col">

                {/* Left: item grid */}
                <div className="min-w-0 flex-1">
                  {filteredItems.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 max-[560px]:grid-cols-1">
                      {filteredItems.map((item) => (
                        <StoreItemCard
                          key={item.id}
                          item={item}
                          balance={balance}
                          onRedeem={handleRedeem}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[22px] border-[1.5px] border-dashed border-[#e0d0c5] bg-[#fdf8f5] p-12 text-center dark:border-white/9 dark:bg-[#1e1c19] max-[640px]:p-6">
                      <p className="font-['Playfair_Display',serif] text-[18px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
                        Nothing here yet
                      </p>
                      <p className="mt-2 text-[13px] text-[#9b9a92]">
                        Check back soon — new items drop weekly.
                      </p>
                    </div>
                  )}
                </div>

                {/* Right sidebar */}
                <aside className="w-68 shrink-0 flex flex-col gap-4 max-[860px]:w-full max-[860px]:grid max-[860px]:grid-cols-2 max-[560px]:grid-cols-1">

                  {/* Coin history */}
                  <div className="rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 dark:border-white/9 dark:bg-[#1e1c19]">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[#c49a2c]"><CoinsIcon /></span>
                      <span className="font-['Playfair_Display',serif] text-[14px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
                        Coin history
                      </span>
                    </div>
                    <div className="flex flex-col">
                      {COIN_HISTORY.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center gap-2.5 py-2.5 border-b border-[#e8ddd6] last:border-b-0 dark:border-white/8"
                        >
                          <span
                            className={cn(
                              'flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-full text-[11px]',
                              entry.type === 'earn'
                                ? 'bg-[rgba(45,106,71,0.1)] text-[#2d6a47] dark:text-[#3dbf82]'
                                : 'bg-[rgba(184,76,43,0.08)] text-[#b84c2b] dark:text-[#e8816a]',
                            )}
                          >
                            {entry.type === 'earn' ? '↑' : '↓'}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[12px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
                              {entry.label}
                            </div>
                            <div className="truncate text-[10.5px] text-[#9b9a92]">{entry.sub}</div>
                          </div>
                          <span
                            className={cn(
                              'shrink-0 font-[\'DM_Mono\',monospace] text-[11px] font-bold',
                              entry.type === 'earn'
                                ? 'text-[#2d6a47] dark:text-[#3dbf82]'
                                : 'text-[#b84c2b] dark:text-[#e8816a]',
                            )}
                          >
                            {entry.type === 'earn' ? '+' : '−'}{entry.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ways to earn */}
                  <div className="rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 dark:border-white/9 dark:bg-[#1e1c19]">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[#b84c2b] dark:text-[#e8816a]"><SparklesIcon /></span>
                      <span className="font-['Playfair_Display',serif] text-[14px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
                        Ways to earn
                      </span>
                    </div>
                    <div className="flex flex-col gap-3">
                      {EARN_WAYS.map(({ step, text, reward }) => (
                        <div key={step} className="flex items-start gap-3">
                          <span className="font-['DM_Mono',monospace] text-[9px] font-bold text-[#b84c2b] dark:text-[#e8816a] mt-0.5 shrink-0 w-4">
                            {step}
                          </span>
                          <div>
                            <span className="text-[12px] text-[#6b5f58] dark:text-[#9b9a92] leading-normal">{text}</span>
                            <span className="ml-1 font-bold text-[#c49a2c] text-[11.5px]">{reward}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/community/verify')}
                      className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-[rgba(184,76,43,0.22)] bg-transparent px-3 py-1.75 font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.08em] font-bold text-[#b84c2b] transition hover:bg-[rgba(184,76,43,0.07)] dark:border-[rgba(232,129,106,0.25)] dark:text-[#e8816a]"
                    >
                      Go to Verify &amp; Earn <ArrowRightIcon />
                    </button>
                  </div>

                  {/* Scholar's tip */}
                  <div className="rounded-[18px] border-[1.5px] border-[rgba(196,154,44,0.18)] bg-[rgba(196,154,44,0.04)] p-5 dark:border-[rgba(196,154,44,0.15)] dark:bg-[rgba(196,154,44,0.04)] max-[860px]:col-span-2 max-[560px]:col-span-1">
                    <div className="flex items-center gap-1.5 font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.12em] text-[#9b9a92] mb-3">
                      <BulbIcon />
                      Scholar's tip
                    </div>
                    <p className="font-['Playfair_Display',serif] text-[13px] italic text-[#1a1714] dark:text-[#e0d5cb] leading-[1.65] mb-2.5">
                      "Invest in a Tracker Spotlight — a single featured tracker can earn back 10× in clones and community reach."
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

      {/* ── Redeem modal ── */}
      {pendingItem && (
        <RedeemModal
          item={pendingItem}
          balance={balance}
          onConfirm={handleConfirmRedeem}
          onClose={() => setPendingItem(null)}
        />
      )}

      {/* ── Toast ── */}
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  )
}