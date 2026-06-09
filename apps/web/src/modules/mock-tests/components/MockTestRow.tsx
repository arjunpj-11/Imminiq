// ============================================================
// MockTestRow.tsx — aligned with Trackers card style
// ============================================================

import type { MockTestListItem } from '../types/mock-tests.types'
import {
  difficultyBadge,
  formatDate,
  getProgressLabel,
  getTestScore,
  isHighScore,
} from '../utils/mock-tests-formatters'
import { ArrowRightIcon, ClipboardIcon } from './MockTestIcons'

const ShareIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M8.7 12.8L15.3 16.2M15.3 7.8L8.7 11.2M18 9.5C19.3807 9.5 20.5 8.38071 20.5 7C20.5 5.61929 19.3807 4.5 18 4.5C16.6193 4.5 15.5 5.61929 15.5 7C15.5 8.38071 16.6193 9.5 18 9.5ZM6 14.5C7.38071 14.5 8.5 13.3807 8.5 12C8.5 10.6193 7.38071 9.5 6 9.5C4.61929 9.5 3.5 10.6193 3.5 12C3.5 13.3807 4.61929 14.5 6 14.5ZM18 19.5C19.3807 19.5 20.5 18.3807 20.5 17C20.5 15.6193 19.3807 14.5 18 14.5C16.6193 14.5 15.5 15.6193 15.5 17C15.5 18.3807 16.6193 19.5 18 19.5Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export function MockTestRow({
  test,
  onOpen,
  onShare,
  onStart,
}: {
  test: MockTestListItem
  onOpen: () => void
  onShare: () => void
  onStart: () => void
}) {
  const score = getTestScore(test)

  return (
    <div className="group flex flex-col gap-4 rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] p-4 shadow-[0_2px_16px_rgba(26,23,20,0.06)] transition hover:-translate-y-0.5 hover:border-[rgba(184,76,43,0.22)] hover:shadow-[0_10px_40px_rgba(26,23,20,0.10)] sm:flex-row sm:items-center dark:border-white/10 dark:bg-[#1c1a18] dark:hover:border-white/20">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] text-[#b84c2b] dark:border-[#e8816a]/20 dark:bg-[#e8816a]/10 dark:text-[#e8816a]">
        <ClipboardIcon />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate font-['Playfair_Display',serif] text-[17px] font-black text-[#1a1714] dark:text-[#f2f0eb]">
            {test.title}
          </h3>

          <span className="rounded-full border border-[rgba(184,76,43,0.24)] bg-[rgba(184,76,43,0.08)] px-2.5 py-0.5 font-['DM_Mono',monospace] text-[9px] uppercase tracking-widest text-[#b84c2b] dark:border-[#e8816a]/30 dark:bg-[#e8816a]/10 dark:text-[#e8816a]">
            {difficultyBadge(test.difficulty)}
          </span>

          {test.sourceTestId ? (
            <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 font-['DM_Mono',monospace] text-[9px] uppercase tracking-widest text-blue-700 dark:text-blue-300">
              Shared
            </span>
          ) : null}

          {isHighScore(score) && (
            <span className="rounded-full border border-[rgba(45,106,71,0.22)] bg-[rgba(45,106,71,0.10)] px-2.5 py-0.5 font-['DM_Mono',monospace] text-[9px] uppercase tracking-widest text-[#2d6a47] dark:border-[#3dbf82]/30 dark:bg-[#3dbf82]/10 dark:text-[#3dbf82]">
              High score
            </span>
          )}
        </div>

        <p className="mt-1.5 line-clamp-1 text-[12.5px] text-[#6b5f58] dark:text-[#6b6560]">
          {test.description || 'No description added'} · {test.questionCount}{' '}
          questions · {test.timeLimitMinutes} min · {formatDate(test.createdAt)}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
        <div className="text-right">
          <div className="font-['Playfair_Display',serif] text-[22px] font-black text-[#1a1714] dark:text-[#f2f0eb]">
            {score}%
          </div>

          <div className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-widest text-[#6b5f58] dark:text-[#6b6560]">
            Score
          </div>
        </div>

        <button
          type="button"
          onClick={onOpen}
          className="rounded-[10px] border border-[#e0d0c5] bg-white/35 px-3 py-2 text-[12px] font-bold text-[#6b5f58] transition hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] dark:border-white/10 dark:bg-transparent dark:text-[#9b9a92] dark:hover:border-white/20 dark:hover:text-[#f2f0eb]"
        >
          Details
        </button>

        <button
          type="button"
          onClick={onShare}
          className="inline-flex items-center gap-2 rounded-[10px] border border-[#e0d0c5] bg-white/35 px-3 py-2 text-[12px] font-bold text-[#6b5f58] transition hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] dark:border-white/10 dark:bg-transparent dark:text-[#9b9a92] dark:hover:border-white/20 dark:hover:text-[#f2f0eb]"
        >
          <ShareIcon />
          Share
        </button>

        <button
          type="button"
          onClick={onStart}
          className="inline-flex items-center gap-2 rounded-[10px] bg-[#b84c2b] px-4 py-2 text-[12px] font-bold text-white shadow-[0_2px_12px_rgba(184,76,43,0.22)] transition hover:-translate-y-px hover:bg-[#963d22] dark:bg-[#e8816a] dark:shadow-none dark:hover:bg-[#d9522d]"
        >
          {getProgressLabel(test)} <ArrowRightIcon />
        </button>
      </div>
    </div>
  )
}

export default MockTestRow