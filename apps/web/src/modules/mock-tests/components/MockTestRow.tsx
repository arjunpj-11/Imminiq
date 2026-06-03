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
    <div className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#1c1a18] p-4 transition hover:border-white/20 hover:-translate-y-0.5 sm:flex-row sm:items-center">
      {/* icon badge */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e8816a]/10 text-[#e8816a]">
        <ClipboardIcon />
      </div>

      {/* text */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate font-['Playfair_Display',serif] text-[17px] font-black text-[#f2f0eb]">
            {test.title}
          </h3>

          {/* difficulty pill */}
          <span className="rounded-full border border-[#e8816a]/30 bg-[#e8816a]/10 px-2.5 py-0.5 font-['DM_Mono',monospace] text-[9px] uppercase tracking-widest text-[#e8816a]">
            {difficultyBadge(test.difficulty)}
          </span>

          {isHighScore(score) && (
            <span className="rounded-full border border-[#3dbf82]/30 bg-[#3dbf82]/10 px-2.5 py-0.5 font-['DM_Mono',monospace] text-[9px] uppercase tracking-widest text-[#3dbf82]">
              High score
            </span>
          )}
        </div>

        <p className="mt-1.5 line-clamp-1 text-[12.5px] text-[#6b6560]">
          {test.description || 'No description added'} · {test.questionCount} questions · {test.timeLimitMinutes} min · {formatDate(test.createdAt)}
        </p>
      </div>

      {/* score + actions */}
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <div className="text-right">
          <div className="font-['Playfair_Display',serif] text-[22px] font-black text-[#f2f0eb]">
            {score}%
          </div>
          <div className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-widest text-[#6b6560]">
            Score
          </div>
        </div>

        <button
          type="button"
          onClick={onOpen}
          className="rounded-[10px] border border-white/10 px-3 py-2 text-[12px] font-bold text-[#9b9a92] transition hover:border-white/20 hover:text-[#f2f0eb]"
        >
          Details
        </button>

        <button
          type="button"
          onClick={onStart}
          className="inline-flex items-center gap-2 rounded-[10px] bg-[#e8816a] px-4 py-2 text-[12px] font-bold text-white transition hover:-translate-y-px hover:bg-[#d9522d]"
        >
          {getProgressLabel(test)} <ArrowRightIcon />
        </button>
      </div>
    </div>
  )
}

export default MockTestRow