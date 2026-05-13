// apps/web/src/modules/onboarding/pages/OnboardingRoadmapEvaluationLoadingPage.tsx

import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ThemeToggle from '../../../components/ui/ThemeToggle'
import {
  useRoadmapEvaluationJobStatus,
  type EvaluationJobStatus,
} from '../../../hooks/onboarding/useRoadmapEvaluationJobStatus'

type JobTerminalState = 'completed' | 'failed' | null

type ProgressStepState = 'done' | 'active' | 'pending'

type EvaluationStep = {
  label: string
  activeLabel?: string
}

type ActivityChip = {
  label: string
  icon: ReactNode
}

const cn = (...classes: Array<string | false | null | undefined>) => {
  return classes.filter(Boolean).join(' ')
}

const evaluationSteps: EvaluationStep[] = [
  {
    label: 'Checking completeness',
    activeLabel: 'Checking completeness…',
  },
  {
    label: 'Measuring learning depth',
    activeLabel: 'Measuring learning depth…',
  },
  {
    label: 'Assessing interview-readiness',
    activeLabel: 'Assessing interview-readiness…',
  },
  {
    label: 'Identifying gaps & strengths',
    activeLabel: 'Identifying gaps & strengths…',
  },
  {
    label: 'Compiling score',
    activeLabel: 'Compiling score…',
  },
]

const activityProgressMap = [0, 1, 2, 3, 3]

const fallbackPhaseByProgress = (progress: number) => {
  if (progress >= 100) return 4
  if (progress >= 80) return 4
  if (progress >= 60) return 3
  if (progress >= 35) return 2
  if (progress >= 15) return 1
  return 0
}

const normalizeStepIndex = (
  rawStep: number | undefined,
  completedSteps: number | undefined,
  progress: number
) => {
  if (typeof completedSteps === 'number') {
    if (completedSteps >= 5) return 4
    if (completedSteps >= 0 && completedSteps <= 4) return completedSteps
  }

  if (typeof rawStep === 'number') {
    if (rawStep >= 1 && rawStep <= 5) return rawStep - 1
    if (rawStep >= 0 && rawStep <= 4) return rawStep
  }

  return fallbackPhaseByProgress(progress)
}

const clampProgress = (value: number) =>
  Math.min(100, Math.max(0, Math.round(value)))

const stepProgressFloors = [15, 35, 55, 75, 90]

const defaultEvalStatus = {
  progress: 8,
  activeStepIndex: 0,
  terminalState: null as JobTerminalState,
  logMessage: 'Connecting to the evaluation engine… Preparing your roadmap context.',
  engineLabel: 'Initialising evaluation pipeline',
  nextLabel: 'Estimated next: Completeness check',
  stepsLabel: '0 / 5 steps complete',
  activeActivityIndex: 0,
}

const normalizeEvalStatus = (
  status?: EvaluationJobStatus
) => {
  if (!status) return defaultEvalStatus

  const rawStatus = (status.status || '').toLowerCase()

  const terminalState: JobTerminalState =
    rawStatus === 'completed' || rawStatus === 'success' || rawStatus === 'done'
      ? 'completed'
      : rawStatus === 'failed' || rawStatus === 'error'
        ? 'failed'
        : null

  const completedSteps =
    typeof status.completedSteps === 'number' ? status.completedSteps : undefined

  const rawProgress =
  status.totalSteps > 0
    ? Math.round(
        (status.completedSteps / status.totalSteps) * 100
      )
    : undefined

 const activeStepIndex = normalizeStepIndex(
  status.currentStepNumber,
  completedSteps,
  rawProgress ?? 0
)

  const progress = clampProgress(
    rawProgress ??
      (terminalState === 'completed'
        ? 100
        : stepProgressFloors[activeStepIndex] ?? defaultEvalStatus.progress)
  )

  const completedStepCount =
    terminalState === 'completed'
      ? 5
      : typeof completedSteps === 'number'
        ? Math.min(5, Math.max(0, completedSteps))
        : Math.min(4, Math.max(0, activeStepIndex))

  const defaultActiveStep =
    evaluationSteps[activeStepIndex]?.activeLabel ||
    evaluationSteps[activeStepIndex]?.label ||
    'Evaluating roadmap…'

  const defaultLogByStep = [
    'Scanning your roadmap for topic coverage and structural completeness.',
    'Measuring the depth of each learning area and progression logic.',
    'Assessing how well the roadmap prepares you for real interview scenarios.',
    'Identifying missing topics, strengths, and areas of improvement.',
    'Compiling your final roadmap score and detailed feedback.',
  ]

  const defaultNextLabels = [
    'Estimated next: Learning depth',
    'Estimated next: Interview readiness',
    'Estimated next: Gap analysis',
    'Estimated next: Score compilation',
    'Estimated next: Score ready',
  ]

  return {
    progress,
    activeStepIndex,
    terminalState,
    logMessage:
     terminalState === 'completed'
        ? 'Evaluation complete. Your roadmap score is ready. ✦'
        : terminalState === 'failed'
          ? 'Evaluation failed. Please try again.'
          : defaultLogByStep[activeStepIndex] || defaultEvalStatus.logMessage,
    engineLabel:
      terminalState === 'completed'
        ? 'Evaluation complete'
        : terminalState === 'failed'
          ? 'Evaluation interrupted'
          : defaultActiveStep,
    nextLabel:
      terminalState === 'completed'
        ? 'Ready — redirecting to your score'
        : terminalState === 'failed'
          ? 'Return to roadmap and try again'
          : defaultNextLabels[activeStepIndex] || defaultEvalStatus.nextLabel,
    stepsLabel: `${completedStepCount} / 5 steps complete`,
    activeActivityIndex:
      terminalState === 'completed'
        ? -1
        : activityProgressMap[activeStepIndex] ?? 0,
  }
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const LogoIcon = ({ className = '' }: { className?: string }) => (
  <svg className={cn('block shrink-0 rounded-xl', className)} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="10" y="10" width="80" height="80" rx="18" fill="#050505" />
    <g transform="translate(-5, 1)">
      <rect x="31" y="35" width="9" height="34" rx="4.5" fill="#fff8ed" />
      <circle cx="35.5" cy="28.5" r="5.3" fill="#f15a35" />
      <path d="M64 32.8 C73.8 34.7 79.5 42.2 79.5 51.5 C79.5 61.8 71.2 68 60.2 68 C53.2 68 48.2 65.5 45.1 60.8" fill="none" stroke="#fff8ed" strokeWidth="9" strokeLinecap="round" />
      <line x1="63.8" y1="55.5" x2="75.8" y2="67.5" stroke="#f15a35" strokeWidth="9" strokeLinecap="round" />
    </g>
  </svg>
)

const ActivitySparkIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

const CompletenessIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
  </svg>
)

const DepthIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <line x1="12" y1="2" x2="12" y2="22" />
    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
  </svg>
)

const ReadinessIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const GapIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const activityChips: ActivityChip[] = [
  { label: 'Scanning completeness', icon: <CompletenessIcon /> },
  { label: 'Measuring depth', icon: <DepthIcon /> },
  { label: 'Checking readiness', icon: <ReadinessIcon /> },
  { label: 'Detecting gaps', icon: <GapIcon /> },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusDot = ({ state }: { state: ProgressStepState }) => {
  if (state === 'done') {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#4caf7d] dark:bg-[#5cc98a]">
        <CheckIcon />
      </span>
    )
  }

  if (state === 'active') {
    return (
      <span className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#b84c2b] dark:bg-[#e8816a]">
        <span className="absolute -inset-1 animate-spin rounded-full border-2 border-transparent border-t-[#e8816a] dark:border-t-[#f5a090]" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#fff8ed] dark:bg-[#141412]" />
      </span>
    )
  }

  return (
    <span className="h-6 w-6 shrink-0 rounded-full bg-[#1a1714]/15 dark:bg-[#f2f0eb]/15" />
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingRoadmapEvaluationLoadingPage() {
  const navigate = useNavigate()
  const { jobId } = useParams<{ jobId: string }>()

  const [roadmapTopic] = useState(() =>
    sessionStorage.getItem('imminiq_topic') ||
    sessionStorage.getItem('imminiq_draft_topic') ||
    'MERN stack interviews'
  )

  const [roadmapGoal] = useState(() =>
    sessionStorage.getItem('imminiq_goal') ||
    sessionStorage.getItem('imminiq_draft_goal') ||
    'Crack top company interviews'
  )

  const { data, isLoading, error } = useRoadmapEvaluationJobStatus(jobId)

  const evalStatus = useMemo(
    () => normalizeEvalStatus(data?.data),
    [data?.data]
  )

  const statusError =
    error?.message ||
    data?.data?.errorMessage ||
    (!jobId ? 'Missing evaluation job ID.' : '')

  useEffect(() => {
    if (evalStatus.terminalState !== 'completed') return

    const timer = window.setTimeout(() => {
      navigate(`/onboarding/roadmap-evaluation/${jobId}/score`, { replace: true })
    }, 1800)

    return () => window.clearTimeout(timer)
  }, [evalStatus.terminalState, navigate, jobId])

  const stepStates = useMemo<ProgressStepState[]>(() => {
    return evaluationSteps.map((_, index) => {
      if (evalStatus.terminalState === 'completed') return 'done'

      if (index < evalStatus.activeStepIndex) return 'done'
      if (index === evalStatus.activeStepIndex) return 'active'
      return 'pending'
    })
  }, [evalStatus.activeStepIndex, evalStatus.terminalState])

  return (
    <div className="flex min-h-screen flex-col bg-[#f5ede4] font-[DM_Sans,sans-serif] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]">
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#e0d0c5] bg-[#f5ede4]/92 px-5 backdrop-blur-xl dark:border-white/15 dark:bg-[#141412]/94 sm:px-8 md:px-12">
        <Link to="/" className="inline-flex items-center gap-2.5 leading-none">
          <LogoIcon className="h-8 w-8 rounded-lg" />
          <span className="text-[19px] font-bold leading-none tracking-[-0.5px] text-[#1a1714] dark:text-[#f2f0eb]">
            immin
            <span className="text-[#b84c2b] dark:text-[#e8816a]">iq</span>
            <span className="text-[#b84c2b] dark:text-[#e8816a]">.</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden rounded-full border border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.08)] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.13em] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.09)] dark:text-[#e8816a] sm:inline-flex">
            AI Roadmap Evaluation
          </span>
          <ThemeToggle />
        </div>
      </header>

      {/* ── Main ── */}
      <main className="mx-auto flex w-full max-w-260 flex-1 flex-col items-center gap-8 px-4 py-10 sm:px-6 md:px-8 md:py-12">
        {/* Hero */}
        <section className="flex flex-col items-center text-center">
          <div className="mb-3 font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#b84c2b] dark:text-[#e8816a]">
            AI Roadmap Evaluation
          </div>

          <h1 className="mb-4 max-w-155 font-serif text-[clamp(32px,6vw,54px)] font-extrabold leading-[1.08] tracking-[-1.5px] text-[#1a1714] dark:text-[#f2f0eb]">
            Scoring your learning roadmap
          </h1>

          <p className="max-w-127.5 text-[15px] leading-[1.65] text-[#6b5f58] dark:text-[#9b9a92]">
            Gemini is analysing completeness, depth, interview-readiness, and
            identifying gaps and opportunities in your roadmap.
          </p>
        </section>

        {/* Error banner */}
        {(statusError || isLoading === false && !data) && statusError && (
          <div
            className="flex w-full items-start gap-2.5 rounded-[14px] border border-[rgba(217,69,53,0.2)] border-l-[3px] border-l-[#d94535] bg-[rgba(217,69,53,0.07)] px-4 py-3.5 text-[13px] leading-normal text-[#d94535] dark:border-l-[#ff6b5f] dark:bg-[rgba(255,107,95,0.10)] dark:text-[#ff6b5f]"
            role="alert"
          >
            <span className="mt-0.5">
              <ActivitySparkIcon />
            </span>
            <span>{statusError}</span>
          </div>
        )}

        {/* Two-col cards */}
        <section className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
          {/* Roadmap context card */}
          <article className="rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] px-5 py-6 shadow-[0_4px_24px_rgba(26,23,20,0.07),0_1px_4px_rgba(26,23,20,0.04)] dark:border-white/15 dark:bg-[#1e1c19] dark:shadow-[0_18px_56px_rgba(0,0,0,0.4),0_0_32px_rgba(232,129,106,0.05)] sm:px-6">
            <h2 className="mb-1 font-serif text-[19px] font-bold tracking-[-0.3px] text-[#1a1714] dark:text-[#f2f0eb]">
              Roadmap being evaluated
            </h2>

            <p className="mb-5 text-[12.5px] leading-normal text-[#6b5f58] dark:text-[#9b9a92]">
              Gemini is scoring this roadmap against your learning goals.
            </p>

            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-3 border-b border-[#e0d0c5] py-3 dark:border-white/15">
                <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.13em] text-[#6b5f58]/70 dark:text-[#9b9a92]/70">
                  Field
                </span>
                <span className="max-w-[70%] truncate rounded-md bg-[rgba(184,76,43,0.10)] px-2.75 py-1 text-[12px] font-semibold text-[#b84c2b] dark:bg-[rgba(232,129,106,0.12)] dark:text-[#e8816a]">
                  {roadmapTopic}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 py-3">
                <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.13em] text-[#6b5f58]/70 dark:text-[#9b9a92]/70">
                  Goal
                </span>
                <span className="max-w-[70%] truncate rounded-md bg-[rgba(184,76,43,0.10)] px-2.75 py-1 text-[12px] font-semibold text-[#b84c2b] dark:bg-[rgba(232,129,106,0.12)] dark:text-[#e8816a]">
                  {roadmapGoal}
                </span>
              </div>
            </div>
          </article>

          {/* Evaluation steps card */}
          <article className="rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] px-5 py-6 shadow-[0_4px_24px_rgba(26,23,20,0.07),0_1px_4px_rgba(26,23,20,0.04)] dark:border-white/15 dark:bg-[#1e1c19] dark:shadow-[0_18px_56px_rgba(0,0,0,0.4),0_0_32px_rgba(232,129,106,0.05)] sm:px-6">
            <h2 className="mb-1 font-serif text-[19px] font-bold tracking-[-0.3px] text-[#1a1714] dark:text-[#f2f0eb]">
              Evaluation progress
            </h2>

            <p className="mb-4 text-[12.5px] leading-normal text-[#6b5f58] dark:text-[#9b9a92]">
              Each stage analyses a different dimension of your roadmap quality.
            </p>

            <div className="flex flex-col gap-2.5" role="list">
              {evaluationSteps.map((step, index) => {
                const state = stepStates[index]
                const isActive = state === 'active'
                const isPending = state === 'pending'

                return (
                  <div
                    key={step.label}
                    role="listitem"
                    aria-current={isActive ? 'true' : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border-[1.5px] px-3.5 py-2.5 transition',
                      isActive &&
                        'border-[rgba(184,76,43,0.30)] bg-[rgba(184,76,43,0.07)] dark:border-[rgba(232,129,106,0.30)] dark:bg-[rgba(232,129,106,0.08)]',
                      isPending && 'border-transparent opacity-45',
                      state === 'done' && 'border-transparent'
                    )}
                  >
                    <StatusDot state={state} />

                    <span
                      className={cn(
                        'text-sm font-medium leading-none text-[#1a1714] dark:text-[#f2f0eb]',
                        isPending && 'text-[#6b5f58] dark:text-[#9b9a92]'
                      )}
                    >
                      {isActive ? step.activeLabel || step.label : step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </article>
        </section>

        {/* Progress log section */}
        <section
          className="w-full rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] px-5 py-5 shadow-[0_4px_24px_rgba(26,23,20,0.07),0_1px_4px_rgba(26,23,20,0.04)] dark:border-white/15 dark:bg-[#1e1c19] dark:shadow-[0_18px_56px_rgba(0,0,0,0.4),0_0_32px_rgba(232,129,106,0.05)] sm:px-6"
          aria-live="polite"
          aria-atomic="true"
        >
          <p className="mb-4 min-h-12 text-[16px] font-semibold leading-normal text-[#1a1714] dark:text-[#f2f0eb]">
            {evalStatus.logMessage}
          </p>

          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-[#6b5f58]/60 dark:text-[#9b9a92]/60">
              {evalStatus.engineLabel}
            </span>
            <span className="font-mono text-[8.5px] uppercase tracking-[0.13em] text-[#6b5f58]/60 dark:text-[#9b9a92]/60">
              {evalStatus.nextLabel}
            </span>
          </div>

          <div
            className="relative mb-2 h-1.25 w-full overflow-hidden rounded-full bg-[#1a1714]/8 dark:bg-[#f2f0eb]/10"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={evalStatus.progress}
            aria-label="Evaluation progress"
          >
            <div
              className="relative h-full overflow-hidden rounded-full bg-[#b84c2b] transition-[width] duration-1000 ease-out dark:bg-[#e8816a]"
              style={{ width: `${evalStatus.progress}%` }}
            >
              <span className="absolute inset-y-0 left-0 w-[60%] animate-[roadmapShimmer_1.6s_ease-in-out_infinite] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)]" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-[#6b5f58]/45 dark:text-[#9b9a92]/45">
              {evalStatus.progress}% complete
            </span>
            <span className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-[#6b5f58]/60 dark:text-[#9b9a92]/60">
              {evalStatus.stepsLabel}
            </span>
          </div>
        </section>

        {/* Activity chips */}
        <section
          className="flex w-full flex-wrap justify-center gap-2.25"
          role="list"
          aria-label="Current evaluation activities"
        >
          {activityChips.map((chip, index) => {
            const active =
              evalStatus.terminalState !== 'completed' &&
              index === evalStatus.activeActivityIndex

            return (
              <div
                key={chip.label}
                role="listitem"
                className={cn(
                  'inline-flex items-center gap-1.75 whitespace-nowrap rounded-full border-[1.5px] px-4 py-2.25 text-[12.5px] font-medium shadow-[0_4px_24px_rgba(26,23,20,0.07),0_1px_4px_rgba(26,23,20,0.04)] transition',
                  'border-[#e0d0c5] bg-[#fdf8f5] text-[#6b5f58]',
                  'dark:border-white/15 dark:bg-[#1e1c19] dark:text-[#9b9a92]',
                  active &&
                    'border-[rgba(184,76,43,0.22)] bg-[rgba(184,76,43,0.10)] font-semibold text-[#1a1714] dark:border-[rgba(232,129,106,0.24)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#f2f0eb]'
                )}
              >
                <span
                  className={cn(
                    'shrink-0 opacity-60 transition',
                    active && 'text-[#b84c2b] opacity-100 dark:text-[#e8816a]'
                  )}
                >
                  {chip.icon}
                </span>
                {chip.label}
              </div>
            )
          })}
        </section>

        {/* Failed state CTA */}
        {evalStatus.terminalState === 'failed' && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-xl bg-[#b84c2b] px-5 py-3 text-sm font-bold text-[#fff8ed] transition hover:-translate-y-px hover:bg-[#963d22] hover:shadow-[0_6px_22px_rgba(184,76,43,0.30)] active:translate-y-0 active:shadow-none dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]"
          >
            Return to roadmap
          </button>
        )}
      </main>

      {/* ── Footer ── */}
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

      <style>{`
        @keyframes roadmapShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  )
}