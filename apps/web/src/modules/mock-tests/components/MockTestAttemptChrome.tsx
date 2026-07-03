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
    return 'border-[var(--brand-500)] bg-[var(--brand-500)] font-bold text-white dark:border-[var(--brand-500)] dark:bg-[var(--brand-500)]'
  }

  const question = questions[index]

  if (question && answers[question._id]) {
    return 'border-[var(--success)] bg-[rgba(45,106,71,0.08)] text-[var(--success)] dark:border-[#6fcb8a] dark:bg-transparent dark:text-[#6fcb8a]'
  }

  if (flagged.has(index)) {
    return 'border-[var(--warning)] bg-[rgba(201,128,0,0.08)] text-[var(--warning)] dark:border-[#f0c060] dark:bg-transparent dark:text-[#f0c060]'
  }

  if (visited.has(index)) {
    return 'border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-primary)] dark:border-white/16 dark:bg-[var(--surface-elevated)] dark:text-[var(--text-primary)]'
  }

  return 'border-[var(--border-subtle)] text-[var(--text-secondary)] dark:border-[var(--border-subtle)] dark:text-[var(--text-secondary)]'
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
    <div className="w-full shrink-0 border-b border-(--border-subtle) bg-(--surface-canvas) dark:border-white/8 dark:bg-(--surface-canvas)">
      <div className="mx-auto w-[min(1060px,calc(100%-48px))] max-[640px]:w-[calc(100%-20px)]">
        <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-3 py-1 dark:border-(--border-subtle) dark:bg-white/5">
              <span className="h-1.5 w-1.5 rounded-full bg-(--brand-500) dark:bg-(--brand-500)" />
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-(--brand-500) dark:text-(--text-secondary)">
                Attempt
              </span>
            </div>

            <h1 className="font-ui text-[22px] font-black leading-tight text-(--text-primary) dark:text-(--text-primary)">
              Mock test <span className="text-(--brand-500) dark:text-(--brand-500)">in progress</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-lg border border-(--border-subtle) bg-(--surface-card) px-3.5 py-1.5 font-mono text-[14px] tracking-[0.12em] text-(--text-primary) shadow-(--shadow-1) dark:border-white/16 dark:bg-transparent dark:text-(--text-primary) dark:shadow-none">
              {timerDisplay}
            </div>

            <button
              type="button"
              onClick={onToggleFlag}
              className={cn(
                'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition',
                flagged.has(currentIndex)
                  ? 'border-(--warning) bg-[rgba(201,128,0,0.08)] text-(--warning) dark:border-[#f0c060] dark:bg-transparent dark:text-[#f0c060]'
                  : 'border-(--border-subtle) bg-(--surface-card) text-(--text-secondary) hover:border-(--brand-500) hover:text-(--brand-500) dark:border-white/16 dark:bg-transparent dark:text-(--text-secondary) dark:hover:border-(--brand-500) dark:hover:text-(--brand-500)',
              )}
            >
              <FlagIcon />
              Flag
            </button>

            <button
              type="button"
              onClick={onFinish}
              disabled={isFinishing || !canFinish}
              className="rounded-xl bg-(--brand-500) px-4 py-1.5 font-ui text-[13px] font-bold text-white shadow-[0_2px_12px_rgba(184,76,43,0.22)] transition hover:-translate-y-px hover:bg-(--brand-600) disabled:cursor-not-allowed disabled:opacity-60 dark:bg-(--brand-500) dark:shadow-none dark:hover:bg-[#d9522d]"
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
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border font-mono text-[11px] transition hover:-translate-y-px',
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
    <div className="relative z-20 shrink-0 border-t border-(--border-subtle) bg-[color-mix(in_srgb,var(--surface-canvas)_96%,transparent)] pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-8px_28px_rgba(26,23,20,0.06)] backdrop-blur-xl dark:border-white/8 dark:bg-[color-mix(in_srgb,var(--surface-canvas)_96%,transparent)] dark:shadow-[0_-8px_28px_rgba(0,0,0,0.22)]">
      <div className="mx-auto flex w-[min(1060px,calc(100%-48px))] items-center justify-between gap-3 py-4 max-[640px]:w-[calc(100%-20px)]">
        <button
          type="button"
          onClick={() => onGoTo(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 rounded-md border border-(--border-subtle) bg-(--surface-card) px-5 py-2.5 text-[13px] font-semibold text-(--text-primary) transition hover:border-(--brand-500) hover:text-(--brand-500) disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/16 dark:bg-transparent dark:text-(--text-primary) dark:hover:border-(--brand-500) dark:hover:text-(--brand-500)"
        >
          ← Previous
        </button>

        <div className="flex flex-col items-center gap-1.5">
          <span className="font-ui text-[12px] text-(--text-secondary) dark:text-(--text-secondary)">
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
                      ? 'bg-(--brand-500) dark:bg-(--brand-500)'
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
          className="flex items-center gap-2 rounded-md bg-(--brand-500) px-5 py-2.5 font-ui text-[14px] font-bold text-white shadow-[0_2px_12px_rgba(184,76,43,0.22)] transition hover:-translate-y-px hover:bg-(--brand-600) disabled:cursor-not-allowed disabled:opacity-40 dark:bg-(--brand-500) dark:shadow-none dark:hover:bg-[#d9522d]"
        >
          Next question →
        </button>
      </div>
    </div>
  )
}
