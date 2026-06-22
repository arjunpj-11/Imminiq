import type { CommunityVerifyItem } from '../types/community.types'
import { formatProgress } from '../utils/community-formatters'
import { cn } from '../utils/community-ui'
import { CheckIcon, ClockIcon, DotsIcon } from './icons/CommunityIcons'

interface VerificationCardProps {
  item: CommunityVerifyItem
  onPreview: (submissionId: string) => void
}

const ProgressBar = ({ value, urgent }: { value: number; urgent?: boolean }) => (
  <div className="h-0.75 rounded-full bg-[rgba(26,23,20,0.08)] dark:bg-white/10">
    <div
      className="h-full rounded-full transition-all"
      style={{
        width: formatProgress(value),
        background: urgent ? '#c49a2c' : '#4caf7d',
      }}
    />
  </div>
)

export default function VerificationCard({
  item,
  onPreview,
}: VerificationCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col rounded-[18px] border-[1.5px] bg-[#fdf8f5] transition-all duration-200 dark:bg-[#1e1c19]',
        'hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(26,23,20,0.10)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
        item.closed
          ? 'border-[#e0d0c5] opacity-60 dark:border-white/9'
          : item.urgent
            ? 'border-[#e0d0c5] border-l-[3px] border-l-[#c49a2c] dark:border-white/9 dark:border-l-[#c49a2c]'
            : 'border-[#e0d0c5] border-l-[3px] border-l-[rgba(184,76,43,0.35)] hover:border-l-[rgba(184,76,43,0.55)] dark:border-white/9 dark:border-l-[rgba(232,129,106,0.35)]',
      )}
    >
      <div className="flex flex-1 flex-col gap-0 p-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <span className="inline-flex shrink-0 items-center rounded-full border border-[#e0d0c5] bg-[rgba(26,23,20,0.04)] px-2 py-[2.5px] font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-widest text-[#9b9a92] dark:border-white/9 dark:bg-white/4">
              Tracker
            </span>
            <span className="inline-flex shrink-0 items-center rounded-full border border-[#e0d0c5] bg-[rgba(26,23,20,0.04)] px-2 py-[2.5px] font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-widest text-[#9b9a92] dark:border-white/9 dark:bg-white/4">
              {item.category}
            </span>
            {item.urgent && (
              <span className="inline-flex shrink-0 items-center rounded-full border border-[#c49a2c] bg-[rgba(196,154,44,0.08)] px-2 py-[2.5px] font-['DM_Mono',monospace] text-[7.5px] font-bold uppercase tracking-widest text-[#7c5a1e] dark:text-[#c49a2c]">
                Urgent
              </span>
            )}
          </div>
          <button
            type="button"
            aria-label="More options"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[#9b9a92] transition hover:bg-[rgba(26,23,20,0.06)] dark:hover:bg-white/8"
          >
            <DotsIcon />
          </button>
        </div>

        <h3 className="mb-1.5 font-['Playfair_Display',serif] text-[14px] font-extrabold leading-tight text-[#1a1714] dark:text-[#f2f0eb]">
          {item.title}
        </h3>
        <p className="mb-3 line-clamp-2 text-[11.5px] italic leading-normal text-[#6b5f58] dark:text-[#9b9a92]">
          &quot;{item.excerpt}…&quot;
        </p>

        <ProgressBar value={item.progress} urgent={item.urgent} />

        <div className="mb-3 mt-3 grid grid-cols-3 divide-x divide-[#e8ddd6] overflow-hidden rounded-[10px] border border-[#e8ddd6] dark:divide-white/8 dark:border-white/8">
          <div className="flex flex-col items-center py-2">
            <span className="mb-0.5 font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-widest text-[#9b9a92]">
              Progress
            </span>
            <span className="font-['Playfair_Display',serif] text-[12px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
              {formatProgress(item.progress)}
            </span>
          </div>
          <div className="flex flex-col items-center py-2">
            <span className="mb-0.5 font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-widest text-[#9b9a92]">
              Time left
            </span>
            <span className="flex items-center gap-0.5 font-['Playfair_Display',serif] text-[12px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
              {item.closed ? (
                <span className="text-[11px] text-[#9b9a92]">Closed</span>
              ) : item.timeLeft ? (
                <>
                  <ClockIcon />
                  {item.timeLeft}
                </>
              ) : (
                <span className="text-[#9b9a92]">—</span>
              )}
            </span>
          </div>
          <div className="flex flex-col items-center py-2">
            <span className="mb-0.5 font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-widest text-[#9b9a92]">
              Status
            </span>
            <span className="font-['Playfair_Display',serif] text-[12px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
              {item.votedPass ? 'Voted' : item.closed ? 'Closed' : 'Open'}
            </span>
          </div>
        </div>

        {item.votedPass ? (
          <div className="mt-auto flex items-center gap-2">
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2d6a47] text-white">
              <CheckIcon />
            </span>
            <div>
              <div className="text-[11.5px] font-bold text-[#2d6a47] dark:text-[#5cc98a]">
                Voted Pass
              </div>
              <div className="text-[10px] text-[#9b9a92]">
                Awaiting consensus
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-auto flex items-center justify-between gap-2">
            <span className="font-['DM_Mono',monospace] text-[8px] uppercase leading-tight tracking-widest text-[#9b9a92]">
              {item.closed ? 'Closed' : 'Not reviewed'}
            </span>
            <button
              type="button"
              onClick={() => onPreview(item._id)}
              disabled={item.closed}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-lg border-[1.5px] px-3 py-1.25 text-[11.5px] font-bold transition',
                item.closed
                  ? 'cursor-not-allowed border-[#e0d0c5] text-[#9b9a92] dark:border-white/9'
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
}
