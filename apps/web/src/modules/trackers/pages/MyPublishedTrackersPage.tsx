import { cn } from '../../../lib/cn'

// apps/web/src/modules/trackers/pages/MyPublishedTrackersPage.tsx

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AppShellBoundary } from '../../../components/layout/AppShell'
import { useTrackers, useUnpublishTracker } from '../hooks/useTrackers'
import type { Tracker } from '../types/tracker.types'

const formatDate = (value: string | null | undefined) => {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const domainLabel = (value: string | undefined) => {
  if (!value) return 'Tracker'
  return value.split('_').join(' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

const levelColors: Record<string, { text: string; bg: string; border: string }> = {
  beginner: {
    text: 'text-[#2d6a47] dark:text-[#5cc98a]',
    bg: 'bg-[rgba(45,106,71,0.08)] dark:bg-[rgba(92,201,138,0.10)]',
    border: 'border-[rgba(45,106,71,0.20)] dark:border-[rgba(92,201,138,0.22)]',
  },
  intermediate: {
    text: 'text-[#b84c2b] dark:text-[#e8816a]',
    bg: 'bg-[rgba(184,76,43,0.08)] dark:bg-[rgba(232,129,106,0.10)]',
    border: 'border-[rgba(184,76,43,0.16)] dark:border-[rgba(232,129,106,0.22)]',
  },
  advanced: {
    text: 'text-[#7c5a1e] dark:text-[#d4a84b]',
    bg: 'bg-[rgba(124,90,30,0.08)] dark:bg-[rgba(212,168,75,0.10)]',
    border: 'border-[rgba(124,90,30,0.20)] dark:border-[rgba(212,168,75,0.22)]',
  },
}

// ─── Icons ─────────────────────────────────────────────────────────────────────

const GlobeIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <circle cx="14" cy="14" r="10.5" stroke="currentColor" strokeWidth="1.5" />
    <ellipse cx="14" cy="14" rx="4.5" ry="10.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3.5 14H24.5M4.5 9H23.5M4.5 19H23.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const EyeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M1 7C1 7 3 3 7 3C11 3 13 7 13 7C13 7 11 11 7 11C3 11 1 7 1 7Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    <circle cx="7" cy="7" r="1.75" stroke="currentColor" strokeWidth="1.25" />
  </svg>
)

const UnpublishIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M2 2L12 12M5.5 3.2A5 5 0 0 1 7 3c4 0 6 4 6 4s-.8 1.6-2.2 2.8M8.8 9.8C8.3 10.1 7.7 10.3 7 10.3c-4 0-6-3.3-6-3.3S2 5.4 3.5 4.2" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
  </svg>
)

const CopyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <rect x="4.5" y="4.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
    <path d="M4.5 9.5H2.5A1 1 0 0 1 1.5 8.5V2.5A1 1 0 0 1 2.5 1.5H8.5A1 1 0 0 1 9.5 2.5V4.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
  </svg>
)

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const StarIcon = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
    <path d="M5.5 1L6.9 4.1L10.2 4.4L7.8 6.6L8.5 9.8L5.5 8L2.5 9.8L3.2 6.6L0.8 4.4L4.1 4.1L5.5 1Z" fill="currentColor" />
  </svg>
)

const WarningIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <path d="M11 2L20.5 19H1.5L11 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M11 9V13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="11" cy="16.5" r="0.75" fill="currentColor" />
  </svg>
)

const HeartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M7 12S1.5 8 1.5 4.5A2.5 2.5 0 0 1 7 3.5a2.5 2.5 0 0 1 5.5 1C12.5 8 7 12 7 12Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
  </svg>
)

const CommentIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M2 2h10a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H5l-3 2V3a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
  </svg>
)

// ─── Skeletons ─────────────────────────────────────────────────────────────────

const SkeletonBlock = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse rounded-full bg-[#e8ddd6] dark:bg-white/10', className)} />
)

const PublishedCardSkeleton = () => (
  <div className="animate-pulse rounded-[20px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 dark:border-white/9 dark:bg-[#1e1c19]">
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex gap-2">
        <SkeletonBlock className="h-5 w-20 rounded-full" />
        <SkeletonBlock className="h-5 w-16 rounded-full" />
      </div>
      <SkeletonBlock className="h-7 w-20 rounded-lg" />
    </div>
    <SkeletonBlock className="mb-2 h-6 w-3/4 rounded-lg" />
    <SkeletonBlock className="mb-1 h-4 w-full rounded" />
    <SkeletonBlock className="mb-4 h-4 w-4/5 rounded" />
    <div className="mb-4 h-1.5 rounded-full bg-[#e8ddd6] dark:bg-white/10" />
    <div className="grid grid-cols-3 gap-2 border-y border-[#e0d0c5] py-3 dark:border-white/9">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <SkeletonBlock className="h-2 w-10 rounded-full" />
          <SkeletonBlock className="h-4 w-8 rounded" />
        </div>
      ))}
    </div>
    <div className="mt-4 flex gap-2">
      <SkeletonBlock className="h-8 w-22.5 rounded-[9px]" />
      <SkeletonBlock className="h-8 w-22.5 rounded-[9px]" />
      <SkeletonBlock className="ml-auto h-8 w-22.5 rounded-[9px]" />
    </div>
  </div>
)

// ─── Unpublish Confirmation Modal ──────────────────────────────────────────────

type UnpublishConfirmModalProps = {
  tracker: Tracker | null
  isUnpublishing: boolean
  onConfirm: () => void
  onCancel: () => void
}

function UnpublishConfirmModal({ tracker, isUnpublishing, onConfirm, onCancel }: UnpublishConfirmModalProps) {
  if (!tracker) return null

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      style={{ backgroundColor: 'rgba(20,18,16,0.60)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      {/* Panel */}
      <div className="w-full max-w-100 overflow-hidden rounded-[22px] border-[1.5px] border-[rgba(200,50,50,0.18)] bg-[#fdf8f5] shadow-[0_24px_64px_rgba(20,18,16,0.28)] dark:border-[rgba(255,120,120,0.14)] dark:bg-[#1e1c19]">

        {/* Red accent top bar */}
        <div className="h-0.5 w-full bg-linear-to-r from-[#c83232] to-[#e05555]" />

        <div className="p-6">
          {/* Warning icon */}
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] border-[1.5px] border-[rgba(200,50,50,0.20)] bg-[rgba(200,50,50,0.08)] text-[#b83232] dark:border-[rgba(255,120,120,0.18)] dark:bg-[rgba(255,120,120,0.08)] dark:text-[#ff8c8c]">
            <WarningIcon />
          </div>

          {/* Title */}
          <h2 className="font-['Playfair_Display',serif] text-[19px] font-extrabold leading-[1.2] tracking-[-0.3px] text-[#1a1714] dark:text-[#f2f0eb]">
            Unpublish this tracker?
          </h2>

          {/* Tracker name */}
          <p className="mt-1 text-[12.5px] font-semibold text-[#6b5f58] dark:text-[#9b9a92]">
            "{tracker.title}"
          </p>

          {/* Warning message */}
          <p className="mt-3 text-[13px] leading-[1.6] text-[#6b5f58] dark:text-[#9b9a92]">
            This will remove it from the community. The following will be{' '}
            <span className="font-bold text-[#b83232] dark:text-[#ff8c8c]">permanently lost</span>{' '}
            and cannot be recovered:
          </p>

          {/* Loss list */}
          <ul className="mt-3 space-y-2">
            <li className="flex items-center gap-2.5 rounded-[10px] border-[1.5px] border-[rgba(200,50,50,0.12)] bg-[rgba(200,50,50,0.05)] px-3 py-2 dark:border-[rgba(255,120,120,0.10)] dark:bg-[rgba(255,120,120,0.05)]">
              <span className="text-[#b83232] dark:text-[#ff8c8c]"><HeartIcon /></span>
              <span className="text-[12.5px] font-medium text-[#4a3f3a] dark:text-[#c8c4bc]">All likes from the community</span>
            </li>
            <li className="flex items-center gap-2.5 rounded-[10px] border-[1.5px] border-[rgba(200,50,50,0.12)] bg-[rgba(200,50,50,0.05)] px-3 py-2 dark:border-[rgba(255,120,120,0.10)] dark:bg-[rgba(255,120,120,0.05)]">
              <span className="text-[#b83232] dark:text-[#ff8c8c]"><CommentIcon /></span>
              <span className="text-[12.5px] font-medium text-[#4a3f3a] dark:text-[#c8c4bc]">All comments & replies</span>
            </li>
            <li className="flex items-center gap-2.5 rounded-[10px] border-[1.5px] border-[rgba(200,50,50,0.12)] bg-[rgba(200,50,50,0.05)] px-3 py-2 dark:border-[rgba(255,120,120,0.10)] dark:bg-[rgba(255,120,120,0.05)]">
              <span className="text-[#b83232] dark:text-[#ff8c8c]"><GlobeSmallIcon /></span>
              <span className="text-[12.5px] font-medium text-[#4a3f3a] dark:text-[#c8c4bc]">Public share link & visibility</span>
            </li>
          </ul>

          <p className="mt-3 text-[11.5px] italic leading-normal text-[#6b5f58] opacity-70 dark:text-[#9b9a92]">
            Your tracker itself and your personal progress are safe — only the community data is lost.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2.5 border-t border-[#e0d0c5] px-6 py-4 dark:border-white/9">
          <button
            type="button"
            onClick={onCancel}
            disabled={isUnpublishing}
            className="flex-1 rounded-[10px] border-[1.5px] border-[#e0d0c5] px-4 py-2.5 text-[13px] font-bold text-[#6b5f58] transition hover:border-[rgba(26,23,20,0.25)] hover:text-[#1a1714] disabled:opacity-50 dark:border-white/9 dark:text-[#9b9a92] dark:hover:text-[#f2f0eb]"
          >
            Keep it public
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isUnpublishing}
            className="flex-1 rounded-[10px] bg-[#b83232] px-4 py-2.5 text-[13px] font-bold text-white transition hover:-translate-y-px hover:bg-[#9a2828] hover:shadow-[0_6px_20px_rgba(184,50,50,0.28)] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#c84444] dark:hover:bg-[#b03030]"
          >
            {isUnpublishing ? 'Unpublishing…' : 'Yes, unpublish'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Small globe icon for the modal list item
const GlobeSmallIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <circle cx="7" cy="7" r="5.25" stroke="currentColor" strokeWidth="1.25" />
    <ellipse cx="7" cy="7" rx="2.25" ry="5.25" stroke="currentColor" strokeWidth="1.25" />
    <path d="M1.75 7H12.25M2.25 4.5H11.75M2.25 9.5H11.75" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
  </svg>
)

// ─── Published Tracker Card ────────────────────────────────────────────────────

type PublishedTrackerCardProps = {
  tracker: Tracker
  onView: (trackerId: string) => void
  onRequestUnpublish: (tracker: Tracker) => void
  isUnpublishing: boolean
}

function PublishedTrackerCard({ tracker, onView, onRequestUnpublish, isUnpublishing }: PublishedTrackerCardProps) {
  const [copied, setCopied] = useState(false)

  const levelCfg = levelColors[tracker.level ?? 'beginner'] ?? levelColors.beginner
  const progress = Math.min(100, Math.max(0, Number(tracker.progressPercent ?? 0)))
  const totalTopics = Number(tracker.topicsCount ?? 0)
  const completedTopics = Number(tracker.completedTopics ?? 0)

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `${window.location.origin}/community/trackers/${tracker._id}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[20px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] transition hover:-translate-y-0.5 hover:border-[rgba(45,106,71,0.30)] hover:shadow-[0_10px_40px_rgba(26,23,20,0.10)] dark:border-white/9 dark:bg-[#1e1c19] dark:hover:border-[rgba(92,201,138,0.20)]">

      {/* Green accent bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-[20px] bg-linear-to-r from-[#70d49a] to-[#4caf7d]" />

      {/* ── Header: badges + clone count ── */}
      <div className="mb-4 flex items-start justify-between gap-2">
        {/* Left: badges */}
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <span className="shrink-0 rounded-full border border-[rgba(45,106,71,0.20)] bg-[rgba(45,106,71,0.08)] px-2.5 py-0.5 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.12em] text-[#2d6a47] dark:border-[rgba(92,201,138,0.22)] dark:bg-[rgba(92,201,138,0.10)] dark:text-[#5cc98a]">
            ● Public
          </span>
          <span className={cn('shrink-0 rounded-full border px-2.5 py-0.5 font-["DM_Mono",monospace] text-[8px] uppercase tracking-[0.12em]', levelCfg.text, levelCfg.bg, levelCfg.border)}>
            {tracker.level ?? 'beginner'}
          </span>
          <span className="shrink-0 rounded-full border border-[#e0d0c5] bg-[rgba(26,23,20,0.03)] px-2.5 py-0.5 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.12em] text-[#6b5f58] dark:border-white/9 dark:text-[#9b9a92]">
            {domainLabel(tracker.domain)}
          </span>
        </div>

        {/* Right: star count */}
        <div className="flex shrink-0 items-center gap-1 rounded-lg border border-[#e0d0c5] bg-[rgba(26,23,20,0.02)] px-2.5 py-1 dark:border-white/9 dark:bg-white/3">
          <span className="text-[#b84c2b] dark:text-[#e8816a]">
            <StarIcon />
          </span>
        </div>
      </div>

      {/* ── Title & description ── */}
      <div className="flex-1">
        <h2 className="font-['Playfair_Display',serif] text-[20px] font-extrabold leading-[1.2] tracking-[-0.4px] text-[#1a1714] transition group-hover:text-[#2d6a47] dark:text-[#f2f0eb] dark:group-hover:text-[#5cc98a]">
          {tracker.title}
        </h2>
        <p className="mt-1.5 line-clamp-2 min-h-[2.8em] text-[12.5px] leading-[1.55] text-[#6b5f58] dark:text-[#9b9a92]">
          {tracker.description ?? tracker.goal ?? 'Personalized learning tracker'}
        </p>
      </div>

      {/* ── Progress bar ── */}
      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.12em] text-[#6b5f58] opacity-55 dark:text-[#9b9a92]">
            Your progress
          </span>
          <span className="font-['DM_Mono',monospace] text-[10px] tracking-[0.04em] text-[#2d6a47] dark:text-[#5cc98a]">
            {progress}%
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(26,23,20,0.08)] dark:bg-white/8">
          <div
            className="h-full rounded-full bg-linear-to-r from-[#70d49a] to-[#4caf7d] transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* ── Mini stats ── */}
      <div className="mt-4 grid grid-cols-3 divide-x divide-[#e0d0c5] border-y border-[#e0d0c5] py-2.5 dark:divide-white/9 dark:border-white/9">
        <div className="text-center">
          <div className="font-['DM_Mono',monospace] text-[7px] uppercase tracking-[0.12em] text-[#6b5f58] opacity-50 dark:text-[#9b9a92]">Topics</div>
          <div className="mt-0.5 text-[13px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">{totalTopics}</div>
        </div>
        <div className="text-center">
          <div className="font-['DM_Mono',monospace] text-[7px] uppercase tracking-[0.12em] text-[#6b5f58] opacity-50 dark:text-[#9b9a92]">Done</div>
          <div className="mt-0.5 text-[13px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">{completedTopics}</div>
        </div>
        <div className="text-center">
          <div className="font-['DM_Mono',monospace] text-[7px] uppercase tracking-[0.12em] text-[#6b5f58] opacity-50 dark:text-[#9b9a92]">Published</div>
          <div className="mt-0.5 text-[11px] font-semibold text-[#6b5f58] dark:text-[#9b9a92]">{formatDate(tracker.publishedAt)}</div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="mt-4 flex flex-col gap-2">
        {/* Primary actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onView(tracker._id) }}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[9px] bg-[#b84c2b] px-3.5 py-2 text-[12px] font-bold text-[#fdf8f5] transition hover:-translate-y-px hover:bg-[#963d22] hover:shadow-[0_6px_20px_rgba(184,76,43,0.24)] dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]"
          >
            <EyeIcon />
            View Page
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[9px] border-[1.5px] border-[#e0d0c5] px-3.5 py-2 text-[12px] font-bold text-[#6b5f58] transition hover:border-[rgba(184,76,43,0.30)] hover:bg-[rgba(184,76,43,0.06)] hover:text-[#b84c2b] dark:border-white/9 dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
          >
            {copied ? <><CheckIcon />Copied!</> : <><CopyIcon />Copy Link</>}
          </button>
        </div>

        {/* Destructive action — separate row, full width */}
        <button
          type="button"
          disabled={isUnpublishing}
          onClick={(e) => { e.stopPropagation(); onRequestUnpublish(tracker) }}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-[9px] border-[1.5px] border-[rgba(200,50,50,0.20)] px-3.5 py-2 text-[12px] font-bold text-[#b83232] transition hover:bg-[rgba(200,50,50,0.08)] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[rgba(255,120,120,0.18)] dark:text-[#ff8c8c] dark:hover:bg-[rgba(255,120,120,0.08)]"
        >
          <UnpublishIcon />
          {isUnpublishing ? 'Unpublishing…' : 'Unpublish'}
        </button>
      </div>
    </article>
  )
}

// ─── Skeleton page ─────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <AppShellBoundary>
      <div className="mx-auto mt-5.5 flex w-[min(1180px,calc(100%-48px))] max-w-full flex-col gap-6 pb-24 max-[900px]:mt-4.5 max-[900px]:w-[min(100%,calc(100%-32px))]">
        <div className="animate-pulse">
          <SkeletonBlock className="mb-3 h-5 w-28 rounded-full" />
          <SkeletonBlock className="h-9 w-72 rounded-2xl" />
          <SkeletonBlock className="mt-3 h-4 w-96" />
        </div>
        <div className="grid grid-cols-3 gap-4 max-[1100px]:grid-cols-2 max-[700px]:grid-cols-1">
          {Array.from({ length: 6 }).map((_, index) => (
            <PublishedCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </AppShellBoundary>
  )
}

// ─── Summary strip ─────────────────────────────────────────────────────────────

function SummaryStrip({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <div className="flex items-center gap-3 rounded-[14px] border-[1.5px] border-[rgba(45,106,71,0.16)] bg-[rgba(45,106,71,0.05)] px-4 py-3 dark:border-[rgba(92,201,138,0.15)] dark:bg-[rgba(92,201,138,0.06)]">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[rgba(45,106,71,0.12)] text-[#2d6a47] dark:bg-[rgba(92,201,138,0.14)] dark:text-[#5cc98a]">
        <GlobeIcon />
      </div>
      <p className="text-[12.5px] leading-normal text-[#2d6a47] dark:text-[#5cc98a]">
        <span className="font-bold">{count}</span> tracker{count === 1 ? '' : 's'} currently{' '}
        <span className="font-bold">live</span> in the community.
      </p>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function MyPublishedTrackersPage() {
  const navigate = useNavigate()
  const [unpublishingId, setUnpublishingId] = useState<string | null>(null)
  const [confirmTracker, setConfirmTracker] = useState<Tracker | null>(null)

  const trackersQuery = useTrackers({ status: 'all', domain: 'all', sortBy: 'lastActive', page: 1, limit: 50 })
  const unpublishMutation = useUnpublishTracker()

  const allTrackers = trackersQuery.data?.trackers ?? []
  const publishedTrackers = allTrackers.filter(
    (t) => t.visibility === 'public' || Boolean(t.publishedAt)
  )

  const isLoading = trackersQuery.isLoading && !trackersQuery.data

  const handleRequestUnpublish = (tracker: Tracker) => {
    setConfirmTracker(tracker)
  }

  const handleConfirmUnpublish = async () => {
    if (!confirmTracker) return
    setUnpublishingId(confirmTracker._id)
    try {
      await unpublishMutation.mutateAsync(confirmTracker._id)
    } finally {
      setUnpublishingId(null)
      setConfirmTracker(null)
    }
  }

  const handleCancelUnpublish = () => {
    setConfirmTracker(null)
  }

  if (isLoading) {
    return <PageSkeleton />
  }

  return (
    <AppShellBoundary>
      {/* ── Unpublish confirmation modal ── */}
      <UnpublishConfirmModal
        tracker={confirmTracker}
        isUnpublishing={unpublishingId === confirmTracker?._id}
        onConfirm={handleConfirmUnpublish}
        onCancel={handleCancelUnpublish}
      />

      <div className="mx-auto mt-5.5 flex w-[min(1180px,calc(100%-48px))] max-w-full min-w-0 flex-col gap-6 pb-[calc(80px+env(safe-area-inset-bottom,0)+16px)] max-[900px]:mt-4.5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[640px]:mt-3 max-[640px]:w-[calc(100%-20px)]">

        {/* ── Page header ── */}
        <section className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-[rgba(45,106,71,0.20)] bg-[rgba(45,106,71,0.08)] px-3 py-1 font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.12em] text-[#2d6a47] dark:border-[rgba(92,201,138,0.22)] dark:bg-[rgba(92,201,138,0.10)] dark:text-[#5cc98a]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4caf7d] dark:bg-[#5cc98a]" />
              Published Trackers
            </div>

            <h1 className="font-['Playfair_Display',serif] text-[clamp(26px,3.5vw,38px)] font-extrabold leading-[1.15] tracking-[-0.8px] text-[#1a1714] dark:text-[#f2f0eb]">
              Your{' '}
              <span className="text-[#2d6a47] dark:text-[#5cc98a]">public</span>{' '}
              roadmaps
            </h1>

            <p className="mt-2 max-w-lg text-[13px] italic leading-[1.55] text-[#6b5f58] opacity-80 dark:text-[#9b9a92]">
              {publishedTrackers.length > 0
                ? `${publishedTrackers.length} tracker${publishedTrackers.length === 1 ? '' : 's'} shared with the community. Manage visibility, copy links, and track engagement.`
                : 'Share your learning roadmaps with the community and help others grow.'}
            </p>
          </div>

        </section>

        {/* ── Summary strip (only when trackers exist) ── */}
        <SummaryStrip count={publishedTrackers.length} />

        {/* ── Grid or empty state ── */}
        {publishedTrackers.length > 0 ? (
          <section className="grid grid-cols-3 gap-4 max-[1100px]:grid-cols-2 max-[700px]:grid-cols-1">
            {publishedTrackers.map((tracker) => (
              <PublishedTrackerCard
                key={tracker._id}
                tracker={tracker}
                onView={(id) => navigate(`/trackers/${id}/preview`)}
                onRequestUnpublish={handleRequestUnpublish}
                isUnpublishing={unpublishingId === tracker._id}
              />
            ))}
          </section>
        ) : (
          <section className="rounded-[22px] border-[1.5px] border-dashed border-[#e0d0c5] bg-[#fdf8f5] p-10 text-center shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19] max-[640px]:p-6">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border-[1.5px] border-[rgba(45,106,71,0.20)] bg-[rgba(45,106,71,0.08)] text-[#2d6a47] dark:border-[rgba(92,201,138,0.22)] dark:bg-[rgba(92,201,138,0.10)] dark:text-[#5cc98a]">
              <GlobeIcon />
            </div>

            <h2 className="font-['Playfair_Display',serif] text-2xl font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
              Nothing published yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-[13px] leading-[1.6] text-[#6b5f58] dark:text-[#9b9a92]">
              Go to your trackers, open the options menu on any tracker and hit Publish to share it with the community.
            </p>

            <button
              type="button"
              onClick={() => navigate('/trackers')}
              className="mt-5 inline-flex items-center gap-2 rounded-[10px] bg-[#2d6a47] px-5 py-2.5 text-[13px] font-bold text-white transition hover:-translate-y-px hover:bg-[#245638] dark:bg-[#5cc98a] dark:text-[#141412]"
            >
              Go to My Trackers
            </button>
          </section>
        )}
      </div>
    </AppShellBoundary>
  )
}
