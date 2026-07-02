import { cn } from '../../../lib/cn'

import { useEffect, useRef, useState } from 'react'
import type { Tracker } from '../types/tracker.types'
import PublishTrackerModal, { type PublishFormData } from './PublishTrackerModal'

export type { PublishFormData } from './PublishTrackerModal'

const formatRelativeTime = (value: string | null | undefined) => {
  if (!value) return 'Not started'

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

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

const domainLabel = (value: string | undefined) => {
  if (!value) return 'Tracker'

  return value
    .split('_')
    .join(' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

const getTone = (status: Tracker['status']) => {
  if (status === 'completed') {
    return {
      bar: 'from-[#70d49a] to-[#4caf7d]',
      badge:
        'border-[rgba(45,106,71,0.20)] bg-[rgba(45,106,71,0.08)] text-[#2d6a47] dark:border-[rgba(92,201,138,0.22)] dark:bg-[rgba(92,201,138,0.10)] dark:text-[#5cc98a]',
    }
  }

  if (status === 'archived') {
    return {
      bar: 'from-[#9b9a92] to-[#6b5f58]',
      badge:
        'border-[#e0d0c5] bg-[rgba(26,23,20,0.05)] text-[#6b5f58] dark:border-white/9 dark:bg-white/6 dark:text-[#9b9a92]',
    }
  }

  if (status === 'stalled') {
    return {
      bar: 'from-[#e8c060] to-[#c98000]',
      badge:
        'border-[rgba(138,98,0,0.22)] bg-[rgba(138,98,0,0.08)] text-[#8a6200] dark:border-[rgba(240,168,66,0.24)] dark:bg-[rgba(240,168,66,0.10)] dark:text-[#f0a842]',
    }
  }

  return {
    bar: 'from-[#e8816a] to-[#b84c2b]',
    badge:
      'border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]',
  }
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const InfoIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.25" />
    <path d="M7.5 6.5V10.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    <circle cx="7.5" cy="4.5" r="0.75" fill="currentColor" />
  </svg>
)

const ArchiveIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="1.5" y="1.5" width="12" height="3" rx="1" stroke="currentColor" strokeWidth="1.25" />
    <path d="M2.5 4.5V12.5C2.5 13.05 2.95 13.5 3.5 13.5H11.5C12.05 13.5 12.5 13.05 12.5 12.5V4.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    <path d="M5.5 7.5H9.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
  </svg>
)

const QuickRevisionIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M1.5 7.5a6 6 0 1 0 6-6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    <path d="M1.5 3.5v4h4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7.5 5v3l2 1" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const SpinnerIcon = () => (
  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
  </svg>
)

const VerifyIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M7.5 1.5L12.5 3.5V7.1C12.5 10.25 10.55 12.55 7.5 13.5C4.45 12.55 2.5 10.25 2.5 7.1V3.5L7.5 1.5Z"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinejoin="round"
    />
    <path
      d="M5.25 7.4L6.75 8.9L9.9 5.75"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

// ─── Publish Modal ─────────────────────────────────────────────────────────────

// ─── Tracker Card ──────────────────────────────────────────────────────────────

type TrackerCardProps = {
  tracker: Tracker
  onOpenStudy: (trackerId: string) => void
  onPublish: (trackerId: string, data: PublishFormData) => Promise<void> | void
  onViewPublished: (trackerId: string) => void
  onInfo: (trackerId: string) => void
  onArchive?: (trackerId: string) => void
  onQuickRevision: (trackerId: string) => void
  onSendForVerification: (trackerId: string) => Promise<void> | void
}

export default function TrackerCard({
  tracker,
  onOpenStudy,
  onPublish,
  onViewPublished,
  onInfo,
  onArchive,
  onQuickRevision,
  onSendForVerification,
}: TrackerCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [publishModalOpen, setPublishModalOpen] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)
  const [isSendingVerification, setIsSendingVerification] = useState(false)
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [verificationSent, setVerificationSent] = useState(false)
  const [showPublishNudge, setShowPublishNudge] = useState(false)

  const menuRef = useRef<HTMLDivElement | null>(null)
  const nudgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const progress = Math.min(100, Math.max(0, Number(tracker.progressPercent ?? 0)))
  const tone = getTone(tracker.status)
  const isPublished = tracker.visibility === 'public' || Boolean(tracker.publishedAt)
  const isArchived = tracker.status === 'archived'
  const verificationStatus =
    (
      tracker as Tracker & {
        verificationStatus?: 'pending' | 'verified' | 'rejected' | null
      }
    ).verificationStatus ?? null

  const isVerificationPending = verificationStatus === 'pending' || verificationSent
  const isVerificationVerified = verificationStatus === 'verified'

  // must be published + not archived/pending/verified
  const canSendForVerification =
    isPublished && !isArchived && !isVerificationPending && !isVerificationVerified

  const totalTopics = Number(tracker.topicsCount ?? 0)
  const completedTopics = Number(tracker.completedTopics ?? 0)
  const remainingTopics = Math.max(0, totalTopics - completedTopics)

  useEffect(() => {
    return () => {
      if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const close = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    window.addEventListener('mousedown', close)
    return () => window.removeEventListener('mousedown', close)
  }, [menuOpen])

  const handleMenuAction = (event: React.MouseEvent<HTMLButtonElement>, action: () => void) => {
    event.stopPropagation()
    setMenuOpen(false)
    action()
  }

  const handlePublish = async (trackerId: string, data: PublishFormData) => {
    try {
      setIsPublishing(true)
      setPublishError(null)
      await onPublish(trackerId, data)
      setPublishModalOpen(false)
    } catch (error) {
      setPublishError(
        error instanceof Error ? error.message : 'Failed to publish tracker. Please try again.'
      )
    } finally {
      setIsPublishing(false)
    }
  }

  const triggerPublishNudge = () => {
    setShowPublishNudge(true)
    if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current)
    nudgeTimerRef.current = setTimeout(() => setShowPublishNudge(false), 3500)
  }

  const handleSendForVerification = async () => {
    if (isSendingVerification) return

    if (!isPublished) {
      triggerPublishNudge()
      return
    }

    if (!canSendForVerification) return

    try {
      setIsSendingVerification(true)
      setVerificationError(null)
      await onSendForVerification(tracker._id)
      setVerificationSent(true)
    } catch (error) {
      setVerificationError(
        error instanceof Error
          ? error.message
          : 'Failed to send tracker for verification. Please try again.',
      )
    } finally {
      setIsSendingVerification(false)
    }
  }

  const verificationMenuLabel = isSendingVerification
    ? 'Sending...'
    : isVerificationVerified
      ? 'Already verified'
      : isVerificationPending
        ? 'Verification pending'
        : 'Send for verification'

  // button is disabled only when action is truly unavailable (pending/verified/sending)
  // unpublished case is handled via nudge instead of disabling
  const verificationButtonDisabled =
    isSendingVerification || isVerificationPending || isVerificationVerified || isArchived

  return (
    <>
      <article
        role="button"
        tabIndex={0}
        onClick={() => onOpenStudy(tracker._id)}
        onKeyDown={(event) => { if (event.key === 'Enter') onOpenStudy(tracker._id) }}
        className="group relative min-h-72 cursor-pointer overflow-visible rounded-[20px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] transition hover:-translate-y-1 hover:border-[rgba(184,76,43,0.22)] hover:shadow-[0_10px_40px_rgba(26,23,20,0.10)] focus:outline-none focus:ring-3 focus:ring-[rgba(184,76,43,0.18)] dark:border-white/9 dark:bg-[#1e1c19] dark:hover:border-[rgba(232,129,106,0.24)]"
      >
        <div className={cn('absolute bottom-0 left-0 right-0 h-0.75 rounded-b-[20px] bg-linear-to-r', tone.bar)} />

        {/* ── Header ── */}
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn('rounded-full border px-3 py-1 font-["DM_Mono",monospace] text-[8px] uppercase tracking-[0.12em]', tone.badge)}>
              {domainLabel(tracker.domain)}
            </span>
            {isPublished && (
              <span className="rounded-full border border-[rgba(45,106,71,0.20)] bg-[rgba(45,106,71,0.08)] px-3 py-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.12em] text-[#2d6a47] dark:border-[rgba(92,201,138,0.22)] dark:bg-[rgba(92,201,138,0.10)] dark:text-[#5cc98a]">
                Published
              </span>
            )}
            {isArchived && (
              <span className="rounded-full border border-[#e0d0c5] bg-[rgba(26,23,20,0.05)] px-3 py-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.12em] text-[#6b5f58] dark:border-white/9 dark:bg-white/6 dark:text-[#9b9a92]">
                Archived
              </span>
            )}
            {isVerificationPending && (
              <span className="rounded-full border border-[rgba(138,98,0,0.22)] bg-[rgba(138,98,0,0.08)] px-3 py-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.12em] text-[#8a6200] dark:border-[rgba(240,168,66,0.24)] dark:bg-[rgba(240,168,66,0.10)] dark:text-[#f0a842]">
                Pending Review
              </span>
            )}
            {isVerificationVerified && (
              <span className="rounded-full border border-[rgba(45,106,71,0.20)] bg-[rgba(45,106,71,0.08)] px-3 py-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.12em] text-[#2d6a47] dark:border-[rgba(92,201,138,0.22)] dark:bg-[rgba(92,201,138,0.10)] dark:text-[#5cc98a]">
                Verified
              </span>
            )}
          </div>

          <div ref={menuRef} className="relative">
            <button
              type="button"
              aria-label="Tracker actions"
              onClick={(event) => { event.stopPropagation(); setMenuOpen((v) => !v) }}
              className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[#6b5f58] transition hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] dark:text-[#9b9a92] dark:hover:bg-[rgba(232,129,106,0.10)] dark:hover:text-[#e8816a]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-10 z-30 w-52 overflow-hidden rounded-[14px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] shadow-[0_16px_56px_rgba(26,23,20,0.18)] dark:border-white/9 dark:bg-[#1e1c19]">
                <button type="button" onClick={(e) => handleMenuAction(e, () => onInfo(tracker._id))} className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-[13px] font-semibold text-[#1a1714] transition hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] dark:text-[#f2f0eb] dark:hover:bg-[rgba(232,129,106,0.10)] dark:hover:text-[#e8816a]">
                  <InfoIcon />Info / Manage
                </button>
                <button type="button" onClick={(e) => handleMenuAction(e, () => onQuickRevision(tracker._id))} className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-[13px] font-semibold text-[#1a1714] transition hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] dark:text-[#f2f0eb] dark:hover:bg-[rgba(232,129,106,0.10)] dark:hover:text-[#e8816a]">
                  <QuickRevisionIcon />Quick Revision
                </button>
                <button
                  type="button"
                  disabled={verificationButtonDisabled}
                  onClick={(e) =>
                    handleMenuAction(e, () => {
                      void handleSendForVerification()
                    })
                  }
                  className={cn(
                    'flex w-full items-center gap-2.5 px-4 py-3 text-left text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-55',
                    canSendForVerification || (!isPublished && !isArchived)
                      ? 'text-[#1a1714] hover:bg-[rgba(45,106,71,0.08)] hover:text-[#2d6a47] dark:text-[#f2f0eb] dark:hover:bg-[rgba(92,201,138,0.10)] dark:hover:text-[#5cc98a]'
                      : 'text-[#9b9a92] dark:text-[#6b5f58]',
                  )}
                >
                  {isSendingVerification ? <SpinnerIcon /> : <VerifyIcon />}
                  {verificationMenuLabel}
                </button>
                {onArchive && (
                  <>
                    <div className="h-px bg-[#e0d0c5] dark:bg-white/9" />
                    <button type="button" onClick={(e) => handleMenuAction(e, () => onArchive(tracker._id))} className={cn('flex w-full items-center gap-2.5 px-4 py-3 text-left text-[13px] font-semibold transition', isArchived ? 'text-[#2d6a47] hover:bg-[rgba(45,106,71,0.08)] dark:text-[#5cc98a] dark:hover:bg-[rgba(92,201,138,0.10)]' : 'text-[#b83232] hover:bg-[rgba(200,50,50,0.08)]')}>
                      <ArchiveIcon />{isArchived ? 'Unarchive' : 'Archive'}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Title & description ── */}
        <h2 className="font-['Playfair_Display',serif] text-[22px] font-extrabold leading-[1.15] tracking-[-0.45px] text-[#1a1714] transition group-hover:text-[#b84c2b] dark:text-[#f2f0eb] dark:group-hover:text-[#e8816a]">
          {tracker.title}
        </h2>
        <p className="mt-2 line-clamp-2 min-h-10 text-[12.5px] leading-[1.55] text-[#6b5f58] dark:text-[#9b9a92]">
          {tracker.description ?? tracker.goal ?? 'Personalized learning tracker'}
        </p>

        {/* ── Progress bar ── */}
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.14em] text-[#6b5f58] opacity-60 dark:text-[#9b9a92]">
              Progress
            </span>
            <span className="font-['DM_Mono',monospace] text-[10px] tracking-[0.06em] text-[#b84c2b] dark:text-[#e8816a]">
              {progress}%
            </span>
          </div>
          <div className="h-1.75 overflow-hidden rounded-full bg-[rgba(26,23,20,0.09)] dark:bg-white/9">
            <div
              className={cn('h-full rounded-full bg-linear-to-r transition-all duration-700', tone.bar)}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* ── Topic stats ── */}
        <div className="mt-5 grid grid-cols-3 divide-x divide-[#e0d0c5] border-y border-[#e0d0c5] py-3 dark:divide-white/9 dark:border-white/9">
          <div className="text-center">
            <div className="font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-[0.12em] text-[#6b5f58] opacity-50 dark:text-[#9b9a92]">
              Topics
            </div>
            <div className="mt-1 text-[14px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
              {totalTopics}
            </div>
          </div>
          <div className="text-center">
            <div className="font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-[0.12em] text-[#6b5f58] opacity-50 dark:text-[#9b9a92]">
              Done
            </div>
            <div className="mt-1 text-[14px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
              {completedTopics}
            </div>
          </div>
          <div className="text-center">
            <div className="font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-[0.12em] text-[#6b5f58] opacity-50 dark:text-[#9b9a92]">
              Left
            </div>
            <div className="mt-1 text-[14px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
              {remainingTopics}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <span className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.08em] text-[#6b5f58] opacity-55 dark:text-[#9b9a92]">
            {isArchived
              ? 'Archived'
              : tracker.status === 'completed'
                ? 'Completed'
                : `Active ${formatRelativeTime(tracker.lastActiveAt)}`}
          </span>

          {isPublished ? (
            <button type="button" onClick={(e) => { e.stopPropagation(); onViewPublished(tracker._id) }} className="rounded-[9px] border-[1.5px] border-[#e0d0c5] px-3.5 py-2 text-[12px] font-bold text-[#6b5f58] transition hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] dark:border-white/9 dark:text-[#9b9a92] dark:hover:text-[#e8816a]">
              View Published
            </button>
          ) : (
            <button type="button" onClick={(e) => { e.stopPropagation(); setPublishError(null); setPublishModalOpen(true) }} className="rounded-[9px] border-[1.5px] border-[#e0d0c5] px-3.5 py-2 text-[12px] font-bold text-[#6b5f58] transition hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] dark:border-white/9 dark:text-[#9b9a92] dark:hover:text-[#e8816a]">
              Publish
            </button>
          )}
        </div>

        {/* ── Publish nudge (shown when user clicks verify on unpublished tracker) ── */}
        {showPublishNudge && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-4 rounded-[10px] border border-[rgba(138,98,0,0.22)] bg-[rgba(138,98,0,0.08)] px-3 py-2.5 text-[11.5px] leading-relaxed text-[#8a6200] dark:border-[rgba(240,168,66,0.20)] dark:bg-[rgba(240,168,66,0.06)] dark:text-[#f0a842]"
          >
            Publish this tracker first before sending it for verification.
          </div>
        )}

        {/* ── Verification error ── */}
        {verificationError && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-4 rounded-[10px] border border-[rgba(200,50,50,0.22)] bg-[rgba(200,50,50,0.08)] px-3 py-2 text-[11.5px] leading-relaxed text-[#b83232] dark:border-[rgba(255,120,120,0.20)] dark:bg-[rgba(255,120,120,0.08)] dark:text-[#ff8c8c]"
          >
            {verificationError}
          </div>
        )}
      </article>

      {publishModalOpen && (
        <PublishTrackerModal
          tracker={tracker}
          isPublishing={isPublishing}
          publishError={publishError}
          onClose={() => { if (!isPublishing) { setPublishError(null); setPublishModalOpen(false) } }}
          onConfirm={handlePublish}
        />
      )}
    </>
  )
}
