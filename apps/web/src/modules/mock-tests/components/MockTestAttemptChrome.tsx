import { cn } from '../../../lib/cn'
import type { PublicMockTestQuestion } from '../types/mock-tests.types'
import { FlagIcon } from './MockTestAttemptIcons'

interface AttemptNavigationState {
  currentIndex: number
  totalQuestions: number
  questions: PublicMockTestQuestion[]
  answers: Record<string, string>
  flagged: Set<number>
  visited: Set<number>
  onGoTo: (index: number) => void
}

function getQuestionNumberClass(
  index: number,
  { currentIndex, questions, answers, flagged, visited }: Omit<AttemptNavigationState, 'totalQuestions' | 'onGoTo'>,
) {
  if (index === currentIndex) {
    return 'border-[#b84c2b] bg-[#b84c2b] font-bold text-white dark:border-[#e8816a] dark:bg-[#e8816a]'
  }

  const question = questions[index]

  if (question && answers[question._id]) {
    return 'border-[#2d6a47] bg-[rgba(45,106,71,0.08)] text-[#2d6a47] dark:border-[#6fcb8a] dark:bg-transparent dark:text-[#6fcb8a]'
  }

  if (flagged.has(index)) {
    return 'border-[#c98000] bg-[rgba(201,128,0,0.08)] text-[#c98000] dark:border-[#f0c060] dark:bg-transparent dark:text-[#f0c060]'
  }

  if (visited.has(index)) {
    return 'border-[#e0d0c5] bg-[#fdf8f5] text-[#1a1714] dark:border-white/16 dark:bg-[#252320] dark:text-[#f2f0eb]'
  }

  return 'border-[#e0d0c5] text-[#6b5f58] dark:border-white/9 dark:text-[#9b9a92]'
}

interface MockTestAttemptHeaderProps extends AttemptNavigationState {
  timerDisplay: string
  isFinishing: boolean
  canFinish: boolean
  onToggleFlag: () => void
  onFinish: () => void
}

export function MockTestAttemptHeader({
  timerDisplay,
  currentIndex,
  totalQuestions,
  questions,
  answers,
  flagged,
  visited,
  isFinishing,
  canFinish,
  onToggleFlag,
  onFinish,
  onGoTo,
}: MockTestAttemptHeaderProps) {
  const navigationState = { currentIndex, questions, answers, flagged, visited }

  return (
    <div className="w-full shrink-0 border-b border-[#e0d0c5] bg-[#f5ede4] dark:border-white/8 dark:bg-[#141412]">
      <div className="mx-auto w-[min(1060px,calc(100%-48px))] max-[640px]:w-[calc(100%-20px)]">
        <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-3 py-1 dark:border-white/10 dark:bg-white/5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#b84c2b] dark:bg-[#e8816a]" />
              <span className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.16em] text-[#b84c2b] dark:text-[#9b9a92]">
                Attempt
              </span>
            </div>

            <h1 className="font-['Playfair_Display',serif] text-[22px] font-black leading-tight text-[#1a1714] dark:text-[#f2f0eb]">
              Mock test <span className="text-[#b84c2b] dark:text-[#e8816a]">in progress</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-lg border border-[#e0d0c5] bg-[#fdf8f5] px-3.5 py-1.5 font-['DM_Mono',monospace] text-[14px] tracking-[0.12em] text-[#1a1714] shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/16 dark:bg-transparent dark:text-[#f2f0eb] dark:shadow-none">
              {timerDisplay}
            </div>

            <button
              type="button"
              onClick={onToggleFlag}
              className={cn(
                'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition',
                flagged.has(currentIndex)
                  ? 'border-[#c98000] bg-[rgba(201,128,0,0.08)] text-[#c98000] dark:border-[#f0c060] dark:bg-transparent dark:text-[#f0c060]'
                  : 'border-[#e0d0c5] bg-[#fdf8f5] text-[#6b5f58] hover:border-[#e8816a] hover:text-[#b84c2b] dark:border-white/16 dark:bg-transparent dark:text-[#9b9a92] dark:hover:border-[#e8816a] dark:hover:text-[#e8816a]',
              )}
            >
              <FlagIcon />
              Flag
            </button>

            <button
              type="button"
              onClick={onFinish}
              disabled={isFinishing || !canFinish}
              className="rounded-xl bg-[#b84c2b] px-4 py-1.5 font-['Playfair_Display',serif] text-[13px] font-bold text-white shadow-[0_2px_12px_rgba(184,76,43,0.22)] transition hover:-translate-y-px hover:bg-[#963d22] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#e8816a] dark:shadow-none dark:hover:bg-[#d9522d]"
            >
              {isFinishing ? 'Finishing…' : 'Finish test'}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 pb-4">
          {Array.from({ length: totalQuestions }).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onGoTo(index)}
              aria-label={`Go to question ${index + 1}`}
              aria-current={index === currentIndex ? 'step' : undefined}
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border font-["DM_Mono",monospace] text-[11px] transition hover:-translate-y-px',
                getQuestionNumberClass(index, navigationState),
              )}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

interface MockTestAttemptFooterProps {
  currentIndex: number
  totalQuestions: number
  questions: PublicMockTestQuestion[]
  answers: Record<string, string>
  onGoTo: (index: number) => void
}

export function MockTestAttemptFooter({
  currentIndex,
  totalQuestions,
  questions,
  answers,
  onGoTo,
}: MockTestAttemptFooterProps) {
  return (
    <div className="shrink-0 border-t border-[#e0d0c5] bg-[#f5ede4] dark:border-white/8 dark:bg-[#141412]">
      <div className="mx-auto flex w-[min(1060px,calc(100%-48px))] items-center justify-between gap-3 py-4 max-[640px]:w-[calc(100%-20px)]">
        <button
          type="button"
          onClick={() => onGoTo(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 rounded-[10px] border border-[#e0d0c5] bg-[#fdf8f5] px-5 py-2.5 text-[13px] font-semibold text-[#1a1714] transition hover:border-[#e8816a] hover:text-[#b84c2b] disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/16 dark:bg-transparent dark:text-[#f2f0eb] dark:hover:border-[#e8816a] dark:hover:text-[#e8816a]"
        >
          ← Previous
        </button>

        <div className="flex flex-col items-center gap-1.5">
          <span className="font-['DM_Sans',sans-serif] text-[12px] text-[#6b5f58] dark:text-[#9b9a92]">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: totalQuestions }).map((_, index) => {
              const question = questions[index]
              const done = Boolean((question && answers[question._id]) || index === currentIndex)

              return (
                <div
                  key={index}
                  className={cn(
                    'h-1.5 w-1.5 rounded-full transition',
                    done
                      ? 'bg-[#b84c2b] dark:bg-[#e8816a]'
                      : 'bg-[#d8c8bc] dark:bg-white/16',
                  )}
                />
              )
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onGoTo(currentIndex + 1)}
          disabled={currentIndex === totalQuestions - 1}
          className="flex items-center gap-2 rounded-[14px] bg-[#b84c2b] px-5 py-2.5 font-['Playfair_Display',serif] text-[14px] font-bold text-white shadow-[0_2px_12px_rgba(184,76,43,0.22)] transition hover:-translate-y-px hover:bg-[#963d22] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#e8816a] dark:shadow-none dark:hover:bg-[#d9522d]"
        >
          Next question →
        </button>
      </div>
    </div>
  )
}
