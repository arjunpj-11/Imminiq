import type { CommunityTracker } from '../types/community.types'
import { cn } from '../utils/community-ui'
import { formatCompactNumber } from '../utils/community-formatters'
import {
  CheckIcon,
  CopyIcon,
  DotsIcon,
  StarIcon,
  VerifiedIcon,
} from './icons/CommunityIcons'

interface CommunityTrackerCardProps {
  tracker: CommunityTracker
  cloning?: boolean
  onClone: (trackerId: string) => void
  onOpen: (trackerId: string) => void
}

export default function CommunityTrackerCard({
  tracker,
  cloning = false,
  onClone,
  onOpen,
}: CommunityTrackerCardProps) {
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
        'flex cursor-pointer flex-col rounded-[18px] border-[1.5px] bg-[#fdf8f5] transition duration-200 dark:bg-[#1e1c19]',
        'border-[#e0d0c5] dark:border-white/9',
        'hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(26,23,20,0.10)] focus:outline-none focus:ring-3 focus:ring-[rgba(184,76,43,0.16)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] dark:focus:ring-[rgba(232,129,106,0.18)]',
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
                <VerifiedIcon />
                Verified
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
            onClick={(event) => {
              event.stopPropagation()
            }}
            className="flex h-6 w-6 items-center justify-center rounded-full text-[#9b9a92] transition hover:bg-[rgba(26,23,20,0.06)] dark:hover:bg-white/8"
          >
            <DotsIcon />
          </button>
        </div>

        <h3 className="mb-1.5 font-['Playfair_Display',serif] text-[15px] font-extrabold leading-tight text-[#1a1714] transition group-hover:text-[#b84c2b] dark:text-[#f2f0eb]">
          {tracker.title}
        </h3>

        <p className="mb-auto text-[12px] leading-[1.55] text-[#6b5f58] dark:text-[#9b9a92]">
          {tracker.description}
        </p>

        <div className="mt-4 grid grid-cols-3 divide-x divide-[#e8ddd6] overflow-hidden rounded-[10px] border border-[#e8ddd6] dark:divide-white/8 dark:border-white/8">
          <div className="flex flex-col items-center px-2 py-2.5">
            <span className="mb-0.5 font-['DM_Mono',monospace] text-[8px] uppercase tracking-widest text-[#9b9a92]">
              Rating
            </span>
            <span className="flex items-center gap-1 font-['Playfair_Display',serif] text-[13px] font-extrabold text-[#c49a2c]">
              <StarIcon />
              {tracker.rating.toFixed(1)}
            </span>
          </div>

          <div className="flex flex-col items-center px-2 py-2.5">
            <span className="mb-0.5 font-['DM_Mono',monospace] text-[8px] uppercase tracking-widest text-[#9b9a92]">
              Topic
            </span>
            <span className="max-w-full truncate font-['Playfair_Display',serif] text-[13px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
              {tracker.topic}
            </span>
          </div>

          <div className="flex flex-col items-center px-2 py-2.5">
            <span className="mb-0.5 font-['DM_Mono',monospace] text-[8px] uppercase tracking-widest text-[#9b9a92]">
              Clones
            </span>
            <span className="flex items-center gap-1 font-['Playfair_Display',serif] text-[13px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
              <CopyIcon />
              {formatCompactNumber(tracker.clones)}
            </span>
          </div>
        </div>

        <div className="mt-3.5 flex items-center justify-between gap-3">
          <span className="font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-widest text-[#9b9a92]">
            {tracker.inDashboard ? 'Active · In progress' : 'Not started'}
          </span>

          {tracker.inDashboard ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(45,106,71,0.22)] bg-[rgba(45,106,71,0.07)] px-3.5 py-1.5 text-[12px] font-bold text-[#2d6a47] dark:text-[#5cc98a]">
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
              className="inline-flex items-center gap-1.5 rounded-lg border-[1.5px] border-[rgba(184,76,43,0.22)] bg-transparent px-3.5 py-1.5 text-[12px] font-bold text-[#b84c2b] transition hover:border-[rgba(184,76,43,0.35)] hover:bg-[rgba(184,76,43,0.07)] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[rgba(232,129,106,0.25)] dark:text-[#e8816a]"
            >
              {cloning ? 'Cloning…' : 'Clone tracker'}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}