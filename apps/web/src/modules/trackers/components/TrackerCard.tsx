// apps/web/src/modules/trackers/components/TrackerCard.tsx

import { useEffect, useRef, useState } from 'react'
import type { Tracker } from '../types/tracker.types'

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

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

const InfoIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle
      cx="7.5"
      cy="7.5"
      r="6"
      stroke="currentColor"
      strokeWidth="1.25"
    />
    <path
      d="M7.5 6.5V10.5"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
    <circle cx="7.5" cy="4.5" r="0.75" fill="currentColor" />
  </svg>
)

const ArchiveIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect
      x="1.5"
      y="1.5"
      width="12"
      height="3"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.25"
    />
    <path
      d="M2.5 4.5V12.5C2.5 13.05 2.95 13.5 3.5 13.5H11.5C12.05 13.5 12.5 13.05 12.5 12.5V4.5"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
    <path
      d="M5.5 7.5H9.5"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
  </svg>
)

const QuickRevisionIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M1.5 7.5a6 6 0 1 0 6-6"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
    <path
      d="M1.5 3.5v4h4"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.5 5v3l2 1"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

type TrackerCardProps = {
  tracker: Tracker
  onOpenStudy: (trackerId: string) => void
  onPublish: (trackerId: string) => void
  onViewPublished: (trackerId: string) => void
  onInfo: (trackerId: string) => void
  onArchive?: (trackerId: string) => void
  onQuickRevision: (trackerId: string) => void  
}

export default function TrackerCard({
  tracker,
  onOpenStudy,
  onPublish,
  onViewPublished,
  onInfo,
  onArchive,
  onQuickRevision,
}: TrackerCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const progress = Math.min(
    100,
    Math.max(0, Number(tracker.progressPercent ?? 0)),
  )

  const tone = getTone(tracker.status)

  const isPublished =
    tracker.visibility === 'public' || Boolean(tracker.publishedAt)

  const isArchived = tracker.status === 'archived'

  useEffect(() => {
    if (!menuOpen) return

    const close = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false)
      }
    }

    window.addEventListener('mousedown', close)

    return () => window.removeEventListener('mousedown', close)
  }, [menuOpen])

  const handleMenuAction = (
    event: React.MouseEvent<HTMLButtonElement>,
    action: () => void,
  ) => {
    event.stopPropagation()
    setMenuOpen(false)
    action()
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpenStudy(tracker._id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          onOpenStudy(tracker._id)
        }
      }}
      className="group relative min-h-72 cursor-pointer overflow-visible rounded-[20px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] transition hover:-translate-y-1 hover:border-[rgba(184,76,43,0.22)] hover:shadow-[0_10px_40px_rgba(26,23,20,0.10)] focus:outline-none focus:ring-3 focus:ring-[rgba(184,76,43,0.18)] dark:border-white/9 dark:bg-[#1e1c19] dark:hover:border-[rgba(232,129,106,0.24)]"
    >
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 h-0.75 rounded-b-[20px] bg-linear-to-r',
          tone.bar,
        )}
      />

      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'rounded-full border px-3 py-1 font-["DM_Mono",monospace] text-[8px] uppercase tracking-[0.12em]',
              tone.badge,
            )}
          >
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
        </div>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            aria-label="Tracker actions"
            onClick={(event) => {
              event.stopPropagation()
              setMenuOpen((value) => !value)
            }}
            className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[#6b5f58] transition hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] dark:text-[#9b9a92] dark:hover:bg-[rgba(232,129,106,0.10)] dark:hover:text-[#e8816a]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 z-30 w-52 overflow-hidden rounded-[14px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] shadow-[0_16px_56px_rgba(26,23,20,0.18)] dark:border-white/9 dark:bg-[#1e1c19]">
              <button
                type="button"
                onClick={(event) =>
                  handleMenuAction(event, () => onInfo(tracker._id))
                }
                className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-[13px] font-semibold text-[#1a1714] transition hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] dark:text-[#f2f0eb] dark:hover:bg-[rgba(232,129,106,0.10)] dark:hover:text-[#e8816a]"
              >
                <InfoIcon />
                Info / Manage
              </button>

              <button
  type="button"
  onClick={(event) =>
    handleMenuAction(event, () => onQuickRevision(tracker._id))
  }
  className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-[13px] font-semibold text-[#1a1714] transition hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] dark:text-[#f2f0eb] dark:hover:bg-[rgba(232,129,106,0.10)] dark:hover:text-[#e8816a]"
>
  <QuickRevisionIcon />
  Quick Revision
</button>

<div className="h-px bg-[#e0d0c5] dark:bg-white/9" />

              {onArchive && (
                <>
                  <div className="h-px bg-[#e0d0c5] dark:bg-white/9" />

                  <button
                    type="button"
                    onClick={(event) =>
                      handleMenuAction(event, () =>
                        onArchive(tracker._id),
                      )
                    }
                    className={cn(
                      'flex w-full items-center gap-2.5 px-4 py-3 text-left text-[13px] font-semibold transition',
                      isArchived
                        ? 'text-[#2d6a47] hover:bg-[rgba(45,106,71,0.08)] hover:text-[#2d6a47] dark:text-[#5cc98a] dark:hover:bg-[rgba(92,201,138,0.10)]'
                        : 'text-[#b83232] hover:bg-[rgba(200,50,50,0.08)]',
                    )}
                  >
                    <ArchiveIcon />
                    {isArchived ? 'Unarchive' : 'Archive'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <h2 className="font-['Playfair_Display',serif] text-[22px] font-extrabold leading-[1.15] tracking-[-0.45px] text-[#1a1714] transition group-hover:text-[#b84c2b] dark:text-[#f2f0eb] dark:group-hover:text-[#e8816a]">
        {tracker.title}
      </h2>

      <p className="mt-2 line-clamp-2 min-h-10 text-[12.5px] leading-[1.55] text-[#6b5f58] dark:text-[#9b9a92]">
        {tracker.description ||
          tracker.goal ||
          'Personalized learning tracker'}
      </p>

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
            className={cn(
              'h-full rounded-full bg-linear-to-r transition-all duration-700',
              tone.bar,
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 divide-x divide-[#e0d0c5] border-y border-[#e0d0c5] py-3 dark:divide-white/9 dark:border-white/9">
        <div className="text-center">
          <div className="font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-[0.12em] text-[#6b5f58] opacity-50 dark:text-[#9b9a92]">
            Topics
          </div>

          <div className="mt-1 text-[14px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
            {tracker.topicsCount ?? 0}
          </div>
        </div>

        <div className="text-center">
          <div className="font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-[0.12em] text-[#6b5f58] opacity-50 dark:text-[#9b9a92]">
            Done
          </div>

          <div className="mt-1 text-[14px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
            {tracker.completedSubtopicsCount ?? 0}
          </div>
        </div>

        <div className="text-center">
          <div className="font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-[0.12em] text-[#6b5f58] opacity-50 dark:text-[#9b9a92]">
            Left
          </div>

          <div className="mt-1 text-[14px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
            {Math.max(
              0,
              Number(tracker.subtopicsCount ?? 0) -
                Number(tracker.completedSubtopicsCount ?? 0),
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <span className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.08em] text-[#6b5f58] opacity-55 dark:text-[#9b9a92]">
          {isArchived
            ? 'Archived'
            : tracker.status === 'completed'
              ? 'Completed'
              : `Active ${formatRelativeTime(tracker.lastActiveAt)}`}
        </span>

        {isPublished ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onViewPublished(tracker._id)
            }}
            className="rounded-[9px] border-[1.5px] border-[#e0d0c5] px-3.5 py-2 text-[12px] font-bold text-[#6b5f58] transition hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] dark:border-white/9 dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
          >
            View Published
          </button>
        ) : (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onPublish(tracker._id)
            }}
            className="rounded-[9px] border-[1.5px] border-[#e0d0c5] px-3.5 py-2 text-[12px] font-bold text-[#6b5f58] transition hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] dark:border-white/9 dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
          >
            Publish
          </button>
        )}
      </div>
    </article>
  )
}