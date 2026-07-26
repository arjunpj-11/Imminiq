import { Link } from 'react-router';

import type { ActivityChip } from '../types/onboarding.types';
import { cn } from '../utils/cn';
import { ROUTES } from '../../../../routes/config/route-paths';

interface IOnboardingProgressStatusCardProps {
  logMessage: string;
  engineLabel: string;
  nextLabel: string;
  progress: number;
  stepsLabel: string;
  progressAriaLabel: string;
}

export function OnboardingProgressStatusCard({
  logMessage,
  engineLabel,
  nextLabel,
  progress,
  stepsLabel,
  progressAriaLabel,
}: IOnboardingProgressStatusCardProps) {
  return (
    <section
      className="relative w-full overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-5 shadow-[0_14px_42px_rgba(26,23,20,0.07)] dark:border-white/15 dark:bg-(--surface-card) sm:p-6"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-[rgba(184,76,43,0.08)] blur-3xl dark:bg-[rgba(232,129,106,0.08)]" />

      <div className="relative">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-(--brand-500)" />
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-(--brand-500)">
                Live AI status
              </span>
            </div>
            <p className="mt-3 max-w-190 text-[15px] font-bold leading-6 text-(--text-primary) sm:text-[16px]">
              {logMessage}
            </p>
          </div>

          <div className="flex shrink-0 items-end gap-1 sm:flex-col sm:items-end">
            <span className="font-serif text-[34px] font-black leading-none text-(--brand-500)">
              {progress}
            </span>
            <span className="pb-0.5 text-[11px] font-bold text-(--text-secondary)">%</span>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-[11px] font-semibold text-(--text-secondary)">{engineLabel}</span>
          <span className="text-[11px] font-semibold text-(--text-secondary)">{nextLabel}</span>
        </div>

        <div
          className="relative mt-3 h-2.5 w-full overflow-hidden rounded-full bg-black/8 dark:bg-white/10"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-label={progressAriaLabel}
        >
          <div
            className="relative h-full overflow-hidden rounded-full bg-(--brand-500) transition-[width] duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          >
            <span className="absolute inset-y-0 left-0 w-[55%] animate-[roadmapShimmer_1.6s_ease-in-out_infinite] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.38),transparent)]" />
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.09em] text-(--text-secondary)/70">
            {progress}% complete
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.09em] text-(--text-secondary)/70">
            {stepsLabel}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes roadmapShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </section>
  );
}

interface IOnboardingActivityChipsProps {
  chips: ActivityChip[];
  activeActivityIndex: number;
  completed: boolean;
  ariaLabel: string;
}

export function OnboardingActivityChips({
  chips,
  activeActivityIndex,
  completed,
  ariaLabel,
}: IOnboardingActivityChipsProps) {
  return (
    <section
      className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4"
      role="list"
      aria-label={ariaLabel}
    >
      {chips.map((chip, index) => {
        const active = !completed && index === activeActivityIndex;
        const done = completed || index < activeActivityIndex;

        return (
          <div
            key={chip.label}
            role="listitem"
            className={cn(
              'flex min-h-13 items-center gap-3 rounded-xl border px-3.5 py-3 text-[12px] font-semibold transition',
              'border-(--border-subtle) bg-(--surface-card) text-(--text-secondary) dark:border-white/15 dark:bg-(--surface-card)',
              active &&
                'border-[rgba(184,76,43,0.28)] bg-[rgba(184,76,43,0.08)] text-(--text-primary) shadow-[0_8px_24px_rgba(184,76,43,0.09)] dark:border-[rgba(232,129,106,0.30)] dark:bg-[rgba(232,129,106,0.09)]',
              done &&
                'border-[rgba(76,175,125,0.18)] bg-[rgba(76,175,125,0.06)] text-(--text-primary) dark:border-[rgba(92,201,138,0.20)] dark:bg-[rgba(92,201,138,0.07)]'
            )}
          >
            <span
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-(--border-subtle) bg-(--surface-canvas) text-(--text-secondary) dark:border-white/10',
                active && 'border-transparent bg-(--brand-500) text-white dark:text-[#141412]',
                done && 'border-transparent bg-(--success) text-white'
              )}
            >
              {chip.icon}
            </span>
            <span className="leading-5">{chip.label}</span>
          </div>
        );
      })}
    </section>
  );
}

export function OnboardingWorkflowFooter() {
  return (
    <footer className="border-t border-(--border-subtle) bg-(--surface-canvas) dark:border-white/15">
      <div className="mx-auto flex w-full max-w-280 flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 md:px-12">
        <span className="text-[10px] font-semibold text-(--text-secondary)/65">
          © 2026 Imminiq. Scholarly rigor meets digital intelligence.
        </span>

        <div className="flex items-center gap-4">
          <Link
            to={ROUTES.privacy}
            className="text-[10px] font-bold uppercase tracking-[0.08em] text-(--text-secondary)/65 transition hover:text-(--brand-500)"
          >
            Privacy
          </Link>
          <Link
            to={ROUTES.terms}
            className="text-[10px] font-bold uppercase tracking-[0.08em] text-(--text-secondary)/65 transition hover:text-(--brand-500)"
          >
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
