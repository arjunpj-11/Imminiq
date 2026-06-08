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

export function MockTestRow({
  test,
  onOpen,
  onStart,
}: {
  test: MockTestListItem
  onOpen: () => void
  onStart: () => void
}) {
  const score = getTestScore(test)

  return (
    <div className="group flex flex-col gap-4 rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] p-4 shadow-[0_2px_16px_rgba(26,23,20,0.06)] transition hover:-translate-y-0.5 hover:border-[rgba(184,76,43,0.22)] hover:shadow-[0_10px_40px_rgba(26,23,20,0.10)] sm:flex-row sm:items-center dark:border-white/10 dark:bg-[#1c1a18] dark:hover:border-white/20">
      {/* icon badge */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] text-[#b84c2b] dark:border-[#e8816a]/20 dark:bg-[#e8816a]/10 dark:text-[#e8816a]">
        <ClipboardIcon />
      </div>

      {/* text */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate font-['Playfair_Display',serif] text-[17px] font-black text-[#1a1714] dark:text-[#f2f0eb]">
            {test.title}
          </h3>

          {/* difficulty pill */}
          <span className="rounded-full border border-[rgba(184,76,43,0.24)] bg-[rgba(184,76,43,0.08)] px-2.5 py-0.5 font-['DM_Mono',monospace] text-[9px] uppercase tracking-widest text-[#b84c2b] dark:border-[#e8816a]/30 dark:bg-[#e8816a]/10 dark:text-[#e8816a]">
            {difficultyBadge(test.difficulty)}
          </span>

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

      {/* score + actions */}
      <div className="flex items-center justify-between gap-3 sm:justify-end">
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