// apps/web/src/modules/onboarding/pages/OnboardingRoadmapEvaluationLoadingPage.tsx

import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useOnboardingStore } from '../store/useOnboardingStore'

import {
  useRoadmapEvaluationJobStatus,
  type EvaluationJobStatus,
} from '../hooks/useRoadmapEvaluationJobStatus'
import OnboardingBrandLink from '../components/OnboardingBrandLink'
import {
  OnboardingActivityChips,
  OnboardingProgressStatusCard,
  OnboardingWorkflowFooter,
} from '../components/OnboardingWorkflowStatus'
import { evaluationSteps } from '../constants/onboarding.constants'
import type { ActivityChip, JobTerminalState, ProgressStepState } from '../types/onboarding.types'
import { cn } from '../utils/cn'
import { clampProgress, normalizeProgressStepIndex } from '../utils/onboarding-progress'

const activityProgressMap = [0, 1, 2, 3, 3]

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

 const activeStepIndex = normalizeProgressStepIndex(
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

  const roadmapTopic = useOnboardingStore(
    (state) => state.step1Data?.topic || 'MERN stack interviews',
  )
  const roadmapGoal = useOnboardingStore(
    (state) => state.step1Data?.goal || 'Crack top company interviews',
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
        <OnboardingBrandLink />

        <div className="flex items-center gap-3">
          <span className="hidden rounded-full border border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.08)] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.13em] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.09)] dark:text-[#e8816a] sm:inline-flex">
            AI Roadmap Evaluation
          </span>
          
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

        <OnboardingProgressStatusCard
          logMessage={evalStatus.logMessage}
          engineLabel={evalStatus.engineLabel}
          nextLabel={evalStatus.nextLabel}
          progress={evalStatus.progress}
          stepsLabel={evalStatus.stepsLabel}
          progressAriaLabel="Evaluation progress"
        />

        <OnboardingActivityChips
          chips={activityChips}
          activeActivityIndex={evalStatus.activeActivityIndex}
          completed={evalStatus.terminalState === 'completed'}
          ariaLabel="Current evaluation activities"
        />

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

      <OnboardingWorkflowFooter />

    </div>
  )
}