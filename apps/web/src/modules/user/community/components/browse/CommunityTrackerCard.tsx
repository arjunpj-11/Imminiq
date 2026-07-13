import type { ICommunityTracker } from '../../types/community.types'
import { cn } from '../../utils/community-ui'
import { formatCompactNumber } from '../../utils/community-formatters'
import {
  CheckIcon,
  CopyIcon,
  DotsIcon,
  StarIcon,
  VerifiedIcon,
} from '../icons/CommunityIcons'

interface ICommunityTrackerCardProps {
  tracker: ICommunityTracker
  cloning?: boolean
  onClone: (trackerId: string) => void
  onOpen: (trackerId: string) => void
}

export default function CommunityTrackerCard({
  tracker,
  cloning = false,
  onClone,
  onOpen,
}: ICommunityTrackerCardProps) {
  const handleOpen = () => {
    onOpen(tracker._id)
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          handleOpen()
        }
      }}
      className={cn(
        'flex cursor-pointer flex-col rounded-lg border-[1.5px] bg-(--surface-card) transition duration-200 dark:bg-(--surface-card)',
        'border-(--border-subtle) dark:border-(--border-subtle)',
        'hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(26,23,20,0.10)] focus:outline-none focus:ring-3 focus:ring-[rgba(184,76,43,0.16)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] dark:focus:ring-[rgba(232,129,106,0.18)]',
        tracker.verified
          ? 'border-l-[3px] border-l-[rgba(45,106,71,0.5)] dark:border-l-[rgba(92,201,138,0.35)]'
          : 'border-l-[3px] border-l-[rgba(184,76,43,0.25)] dark:border-l-[rgba(232,129,106,0.18)]',
      )}
    >
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center rounded-full border border-(--border-subtle) bg-[rgba(26,23,20,0.04)] px-2.25 py-0.75 font-mono text-[8px] uppercase tracking-widest text-[#9b9a92] dark:border-(--border-subtle) dark:bg-white/4">
              Tracker
            </span>

            {tracker.verified ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(45,106,71,0.22)] bg-[rgba(45,106,71,0.08)] px-2.25 py-0.75 font-mono text-[8px] uppercase tracking-widest text-(--success) dark:text-(--success)">
                <VerifiedIcon />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full border border-(--border-subtle) bg-[rgba(26,23,20,0.04)] px-2.25 py-0.75 font-mono text-[8px] uppercase tracking-widest text-[#9b9a92] dark:border-(--border-subtle) dark:bg-white/4">
                Community
              </span>
            )}
          </div>

          <span
            aria-hidden="true"
            className="flex h-6 w-6 items-center justify-center rounded-full text-[#9b9a92]"
          >
            <DotsIcon />
          </span>
        </div>

        <h3 className="mb-1.5 font-ui text-[15px] font-extrabold leading-tight text-(--text-primary) transition group-hover:text-(--brand-500) dark:text-(--text-primary)">
          {tracker.title}
        </h3>

        <p className="mb-auto text-[12px] leading-[1.55] text-(--text-secondary) dark:text-(--text-secondary)">
          {tracker.description}
        </p>

        <div className="mt-4 grid grid-cols-3 divide-x divide-[#e8ddd6] overflow-hidden rounded-md border border-[#e8ddd6] dark:divide-white/8 dark:border-white/8">
          <div className="flex flex-col items-center px-2 py-2.5">
            <span className="mb-0.5 font-mono text-[8px] uppercase tracking-widest text-[#9b9a92]">
              Rating
            </span>
            <span className="flex items-center gap-1 font-ui text-[13px] font-extrabold text-[#c49a2c]">
              <StarIcon />
              {tracker.rating.toFixed(1)}
            </span>
          </div>

          <div className="flex flex-col items-center px-2 py-2.5">
            <span className="mb-0.5 font-mono text-[8px] uppercase tracking-widest text-[#9b9a92]">
              Topic
            </span>
            <span className="max-w-full truncate font-ui text-[13px] font-extrabold text-(--text-primary) dark:text-(--text-primary)">
              {tracker.topic}
            </span>
          </div>

          <div className="flex flex-col items-center px-2 py-2.5">
            <span className="mb-0.5 font-mono text-[8px] uppercase tracking-widest text-[#9b9a92]">
              Clones
            </span>
            <span className="flex items-center gap-1 font-ui text-[13px] font-extrabold text-(--text-primary) dark:text-(--text-primary)">
              <CopyIcon />
              {formatCompactNumber(tracker.clones)}
            </span>
          </div>
        </div>

        <div className="mt-3.5 flex items-center justify-end gap-3">
          {tracker.inDashboard ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(45,106,71,0.22)] bg-[rgba(45,106,71,0.07)] px-3.5 py-1.5 text-[12px] font-bold text-(--success) dark:text-(--success)">
              <CheckIcon />
              In dashboard
            </span>
          ) : (
            <button
              type="button"
              disabled={cloning}
              onClick={(event) => {
                event.stopPropagation()
                onClone(tracker._id)
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border-[1.5px] border-[rgba(184,76,43,0.22)] bg-transparent px-3.5 py-1.5 text-[12px] font-bold text-(--brand-500) transition hover:border-[rgba(184,76,43,0.35)] hover:bg-[rgba(184,76,43,0.07)] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[rgba(232,129,106,0.25)] dark:text-(--brand-500)"
            >
              {cloning ? 'Cloning…' : 'Clone tracker'}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
