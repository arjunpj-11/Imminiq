import { Link } from 'react-router-dom'

import type { ActivityChip } from '../types/onboarding.types'
import { cn } from '../utils/cn'

interface OnboardingProgressStatusCardProps {
  logMessage: string
  engineLabel: string
  nextLabel: string
  progress: number
  stepsLabel: string
  progressAriaLabel: string
}

export function OnboardingProgressStatusCard({
  logMessage,
  engineLabel,
  nextLabel,
  progress,
  stepsLabel,
  progressAriaLabel,
}: OnboardingProgressStatusCardProps) {
  return (
    <section
      className="w-full rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] px-5 py-5 shadow-[0_4px_24px_rgba(26,23,20,0.07),0_1px_4px_rgba(26,23,20,0.04)] dark:border-white/15 dark:bg-[#1e1c19] dark:shadow-[0_18px_56px_rgba(0,0,0,0.4),0_0_32px_rgba(232,129,106,0.05)] sm:px-6"
      aria-live="polite"
      aria-atomic="true"
    >
      <p className="mb-4 min-h-12 text-[16px] font-semibold leading-normal text-[#1a1714] dark:text-[#f2f0eb]">
        {logMessage}
      </p>

      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-[#6b5f58]/60 dark:text-[#9b9a92]/60">
          {engineLabel}
        </span>
        <span className="font-mono text-[8.5px] uppercase tracking-[0.13em] text-[#6b5f58]/60 dark:text-[#9b9a92]/60">
          {nextLabel}
        </span>
      </div>

      <div
        className="relative mb-2 h-1.25 w-full overflow-hidden rounded-full bg-[#1a1714]/8 dark:bg-[#f2f0eb]/10"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-label={progressAriaLabel}
      >
        <div
          className="relative h-full overflow-hidden rounded-full bg-[#b84c2b] transition-[width] duration-1000 ease-out dark:bg-[#e8816a]"
          style={{ width: `${progress}%` }}
        >
          <span className="absolute inset-y-0 left-0 w-[60%] animate-[roadmapShimmer_1.6s_ease-in-out_infinite] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)]" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-[#6b5f58]/45 dark:text-[#9b9a92]/45">
          {progress}% complete
        </span>
        <span className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-[#6b5f58]/60 dark:text-[#9b9a92]/60">
          {stepsLabel}
        </span>
      </div>

      <style>{`
        @keyframes roadmapShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </section>
  )
}

interface OnboardingActivityChipsProps {
  chips: ActivityChip[]
  activeActivityIndex: number
  completed: boolean
  ariaLabel: string
}

export function OnboardingActivityChips({
  chips,
  activeActivityIndex,
  completed,
  ariaLabel,
}: OnboardingActivityChipsProps) {
  return (
    <section
      className="flex w-full flex-wrap justify-center gap-2.25"
      role="list"
      aria-label={ariaLabel}
    >
      {chips.map((chip, index) => {
        const active = !completed && index === activeActivityIndex

        return (
          <div
            key={chip.label}
            role="listitem"
            className={cn(
              'inline-flex items-center gap-1.75 whitespace-nowrap rounded-full border-[1.5px] px-4 py-2.25 text-[12.5px] font-medium shadow-[0_4px_24px_rgba(26,23,20,0.07),0_1px_4px_rgba(26,23,20,0.04)] transition',
              'border-[#e0d0c5] bg-[#fdf8f5] text-[#6b5f58]',
              'dark:border-white/15 dark:bg-[#1e1c19] dark:text-[#9b9a92]',
              active &&
                'border-[rgba(184,76,43,0.22)] bg-[rgba(184,76,43,0.10)] font-semibold text-[#1a1714] dark:border-[rgba(232,129,106,0.24)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#f2f0eb]',
            )}
          >
            <span
              className={cn(
                'shrink-0 opacity-60 transition',
                active && 'text-[#b84c2b] opacity-100 dark:text-[#e8816a]',
              )}
            >
              {chip.icon}
            </span>
            {chip.label}
          </div>
        )
      })}
    </section>
  )
}

export function OnboardingWorkflowFooter() {
  return (
    <footer className="flex w-full flex-wrap items-center justify-between gap-3 border-t border-[#e0d0c5] bg-[#f5ede4] px-5 py-5 dark:border-white/15 dark:bg-[#141412] sm:px-8 md:px-12">
      <span className="font-mono text-[8.5px] uppercase tracking-widest text-[#6b5f58]/50 dark:text-[#9b9a92]/50">
        © 2026 Imminiq. Scholarly rigor meets digital intelligence.
      </span>

      <div className="flex items-center gap-4">
        <Link
          to="/privacy"
          className="font-mono text-[8.5px] uppercase tracking-widest text-[#6b5f58]/50 transition hover:text-[#b84c2b] hover:opacity-100 dark:text-[#9b9a92]/50 dark:hover:text-[#e8816a]"
        >
          Privacy
        </Link>
        <Link
          to="/terms"
          className="font-mono text-[8.5px] uppercase tracking-widest text-[#6b5f58]/50 transition hover:text-[#b84c2b] hover:opacity-100 dark:text-[#9b9a92]/50 dark:hover:text-[#e8816a]"
        >
          Terms
        </Link>
      </div>
    </footer>
  )
}
