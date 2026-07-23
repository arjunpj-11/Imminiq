import type { ReactNode } from 'react';

import { cn } from '../utils/cn';
import type { ProgressStepState } from '../types/onboarding.types';
import OnboardingBrandLink from './OnboardingBrandLink';

interface IOnboardingWorkflowHeaderProps {
  label?: string;
  actions?: ReactNode;
}

export function OnboardingWorkflowHeader({ label, actions }: IOnboardingWorkflowHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-(--border-subtle) bg-(--surface-canvas)/90 backdrop-blur-xl dark:border-white/15 dark:bg-(--surface-canvas)/92">
      <div className="mx-auto flex h-16 w-full max-w-280 items-center justify-between gap-4 px-4 sm:px-6 md:px-12">
        <OnboardingBrandLink />

        <div className="flex items-center gap-3">
          {label ? (
            <span className="hidden rounded-full border border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.08)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.11em] text-(--brand-500) dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.09)] sm:inline-flex">
              {label}
            </span>
          ) : null}
          {actions}
        </div>
      </div>
    </header>
  );
}

interface IOnboardingWorkflowHeroProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function OnboardingWorkflowHero({
  eyebrow,
  title,
  description,
}: IOnboardingWorkflowHeroProps) {
  return (
    <section className="relative w-full overflow-hidden rounded-3xl border border-[rgba(184,76,43,0.16)] bg-[linear-gradient(145deg,var(--surface-card),rgba(184,76,43,0.07))] px-5 py-8 text-center shadow-[0_20px_60px_rgba(26,23,20,0.08)] dark:border-[rgba(232,129,106,0.18)] dark:bg-[linear-gradient(145deg,var(--surface-card),rgba(232,129,106,0.07))] sm:px-8 sm:py-10">
      <div className="pointer-events-none absolute -left-16 top-0 h-44 w-44 rounded-full bg-[rgba(184,76,43,0.09)] blur-3xl dark:bg-[rgba(232,129,106,0.09)]" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-52 w-52 rounded-full bg-[rgba(184,76,43,0.08)] blur-3xl dark:bg-[rgba(232,129,106,0.08)]" />

      <div className="relative mx-auto max-w-180">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.10)] text-xl text-(--brand-500) shadow-[0_8px_24px_rgba(184,76,43,0.10)] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)]">
          ✦
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-(--brand-500)">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-serif text-[clamp(30px,5vw,50px)] font-black leading-[1.08] tracking-[-1.2px] text-(--text-primary)">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-145 text-[14px] leading-7 text-(--text-secondary) sm:text-[15px]">
          {description}
        </p>
      </div>
    </section>
  );
}

export interface IOnboardingContextRow {
  label: string;
  value: string;
}

interface IOnboardingContextCardProps {
  title: string;
  description: string;
  rows: IOnboardingContextRow[];
}

export function OnboardingContextCard({ title, description, rows }: IOnboardingContextCardProps) {
  return (
    <article className="h-full rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-5 shadow-[0_12px_36px_rgba(26,23,20,0.06)] dark:border-white/15 dark:bg-(--surface-card) sm:p-6">
      <div className="mb-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-(--brand-500)">
          Personalisation inputs
        </p>
        <h2 className="mt-2 font-serif text-[21px] font-black tracking-[-0.35px] text-(--text-primary)">
          {title}
        </h2>
        <p className="mt-2 text-[13px] leading-6 text-(--text-secondary)">{description}</p>
      </div>

      <dl className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex flex-col gap-2 rounded-xl border border-(--border-subtle) bg-(--surface-canvas)/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-(--surface-canvas)/45"
          >
            <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-(--text-secondary)">
              {row.label}
            </dt>
            <dd className="min-w-0 text-[13px] font-bold text-(--text-primary) sm:max-w-[68%] sm:text-right">
              <span className="line-clamp-2">{row.value}</span>
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

interface IOnboardingStepCardProps {
  title: string;
  description: string;
  steps: Array<{ label: string; activeLabel?: string }>;
  states: ProgressStepState[];
}

const CheckIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

function StepMarker({ state, index }: { state: ProgressStepState; index: number }) {
  if (state === 'done') {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-(--success) text-white shadow-[0_6px_16px_rgba(76,175,125,0.20)]">
        <CheckIcon />
      </span>
    );
  }

  if (state === 'active') {
    return (
      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-(--brand-500) text-[12px] font-black text-white shadow-[0_7px_20px_rgba(184,76,43,0.24)] dark:text-[#141412]">
        <span className="absolute -inset-1 animate-pulse rounded-[14px] border border-[rgba(184,76,43,0.26)] dark:border-[rgba(232,129,106,0.30)]" />
        {index + 1}
      </span>
    );
  }

  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-(--border-subtle) bg-(--surface-canvas) text-[12px] font-black text-(--text-secondary) dark:border-white/10">
      {index + 1}
    </span>
  );
}

export function OnboardingStepCard({
  title,
  description,
  steps,
  states,
}: IOnboardingStepCardProps) {
  return (
    <article className="h-full rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-5 shadow-[0_12px_36px_rgba(26,23,20,0.06)] dark:border-white/15 dark:bg-(--surface-card) sm:p-6">
      <div className="mb-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-(--brand-500)">
          Live workflow
        </p>
        <h2 className="mt-2 font-serif text-[21px] font-black tracking-[-0.35px] text-(--text-primary)">
          {title}
        </h2>
        <p className="mt-2 text-[13px] leading-6 text-(--text-secondary)">{description}</p>
      </div>

      <div className="space-y-2" role="list">
        {steps.map((step, index) => {
          const state = states[index] || 'pending';
          const isActive = state === 'active';

          return (
            <div
              key={step.label}
              role="listitem"
              aria-current={isActive ? 'step' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl border px-3.5 py-3 transition',
                state === 'active' &&
                  'border-[rgba(184,76,43,0.28)] bg-[rgba(184,76,43,0.07)] shadow-[0_6px_20px_rgba(184,76,43,0.08)] dark:border-[rgba(232,129,106,0.30)] dark:bg-[rgba(232,129,106,0.08)]',
                state === 'done' &&
                  'border-[rgba(76,175,125,0.16)] bg-[rgba(76,175,125,0.05)] dark:border-[rgba(92,201,138,0.18)] dark:bg-[rgba(92,201,138,0.06)]',
                state === 'pending' &&
                  'border-transparent bg-(--surface-canvas)/35 text-(--text-secondary) dark:bg-(--surface-canvas)/30'
              )}
            >
              <StepMarker state={state} index={index} />
              <div className="min-w-0 flex-1">
                <span
                  className={cn(
                    'block text-[13px] font-bold leading-5',
                    state === 'pending' ? 'text-(--text-secondary)' : 'text-(--text-primary)'
                  )}
                >
                  {isActive ? step.activeLabel || step.label : step.label}
                </span>
                <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-(--text-secondary)/70">
                  {state === 'done' ? 'Completed' : state === 'active' ? 'In progress' : 'Upcoming'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

interface IOnboardingErrorBannerProps {
  message: string;
}

export function OnboardingErrorBanner({ message }: IOnboardingErrorBannerProps) {
  return (
    <div
      className="flex w-full items-start gap-3 rounded-2xl border border-[rgba(217,69,53,0.20)] bg-[rgba(217,69,53,0.07)] px-4 py-3.5 text-[13px] leading-6 text-(--danger) dark:bg-[rgba(255,107,95,0.10)]"
      role="alert"
    >
      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[11px] font-black">
        !
      </span>
      <span>{message}</span>
    </div>
  );
}
