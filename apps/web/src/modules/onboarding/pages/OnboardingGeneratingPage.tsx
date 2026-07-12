// apps/web/src/modules/onboarding/pages/OnboardingGeneratingPage.tsx

import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useOnboardingStore } from '../store/useOnboardingStore'
import { useRoadmapJobStatus } from '../hooks/useRoadmapJobStatus'
import OnboardingBrandLink from '../components/OnboardingBrandLink'
import {
  OnboardingActivityChips,
  OnboardingProgressStatusCard,
  OnboardingWorkflowFooter,
} from '../components/OnboardingWorkflowStatus'
import { generationSteps } from '../constants/onboarding.constants'
import type { ActivityChip, IJobStatusApiData, JobTerminalState, INormalizedJobStatus, ProgressStepState } from '../types/onboarding.types'
import { cn } from '../utils/cn'
import { clampProgress, normalizeProgressStepIndex } from '../utils/onboarding-progress'

const activityProgressMap = [0, 1, 2, 3, 3]

const capitalize = (value: string) => {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}

const CheckIcon = () => {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="3"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

const ProfileInputIcon = () => {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M9 9h6M9 12h6M9 15h4" />
    </svg>
  )
}

const SearchIcon = () => {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

const PriorityIcon = () => {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  )
}

const FlagIcon = () => {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  )
}

const ActivitySparkIcon = () => {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

const activityChips: ActivityChip[] = [
  {
    label: 'Reading profile inputs',
    icon: <ProfileInputIcon />,
  },
  {
    label: 'Detecting weak areas',
    icon: <SearchIcon />,
  },
  {
    label: 'Ranking topic priority',
    icon: <PriorityIcon />,
  },
  {
    label: 'Creating milestones',
    icon: <FlagIcon />,
  },
]

const defaultJobStatus: INormalizedJobStatus = {
  progress: 8,
  activeStepIndex: 0,
  terminalState: null,
  logMessage:
    'Connecting to the roadmap engine… Preparing your learning context.',
  engineLabel: 'Initialising generation pipeline',
  nextLabel: 'Estimated next: Goal analysis',
  stepsLabel: '0 / 5 steps complete',
  activeActivityIndex: 0,
}

// Each index corresponds to a generation step (0–4).
// Used as the progress floor when the API does not return an explicit
// progress / progressPercent / percentage value.
const stepProgressFloors = [15, 35, 55, 75, 90]

const normalizeJobStatus = (
  payload: IJobStatusApiData | undefined
): INormalizedJobStatus => {
  if (!payload) {
    return defaultJobStatus
  }

  const rawStatus = (payload.status || payload.state || '').toLowerCase()

  const terminalState: JobTerminalState =
    rawStatus === 'completed' || rawStatus === 'success' || rawStatus === 'done'
      ? 'completed'
      : rawStatus === 'failed' || rawStatus === 'error'
        ? 'failed'
        : null

  const completedSteps =
    payload.completedSteps ?? payload.completedStep ?? undefined

  // Resolve the explicit progress value from the API (may be undefined).
  const rawProgress =
    payload.progress ?? payload.progressPercent ?? payload.percentage

  // Compute activeStepIndex first so it can drive the progress fallback
  // when the API omits a percentage field.
  const activeStepIndex = normalizeProgressStepIndex(
    payload.currentStep ?? payload.step,
    completedSteps,
    rawProgress ?? 0
  )

  // If the API sends an explicit progress value use it directly; otherwise
  // derive a meaningful floor from the current step so the bar advances
  // visibly with each step update instead of staying frozen at 8 %.
  const progress = clampProgress(
    rawProgress ??
      (terminalState === 'completed'
        ? 100
        : stepProgressFloors[activeStepIndex] ?? defaultJobStatus.progress)
  )

  const completedStepCount =
    terminalState === 'completed'
      ? 5
      : typeof completedSteps === 'number'
        ? Math.min(5, Math.max(0, completedSteps))
        : Math.min(4, Math.max(0, activeStepIndex))

  const defaultActiveStep =
    generationSteps[activeStepIndex]?.activeLabel ||
    generationSteps[activeStepIndex]?.label ||
    'Generating roadmap…'

  const defaultLogByStep = [
    'Analysing your selected topic and goal to understand the roadmap direction.',
    'Mapping the most important topic areas for your preparation stage.',
    'Structuring the roadmap flow, practice depth, and topic progression.',
    'Matching supportive resources and implementation guidance.',
    'Finalising your personalised learning path and preparing the result.',
  ]

  const defaultNextLabels = [
    'Estimated next: Topic mapping',
    'Estimated next: Roadmap structure',
    'Estimated next: Resource mapping',
    'Estimated next: Finalisation',
    'Estimated next: Roadmap ready',
  ]

  return {
    progress,
    activeStepIndex,
    terminalState,
    logMessage:
      payload.logMessage ||
      payload.message ||
      (terminalState === 'completed'
        ? 'Roadmap complete. Your personalised learning path is ready. ✦'
        : terminalState === 'failed'
          ? 'Roadmap generation failed. Please try again from the previous step.'
          : defaultLogByStep[activeStepIndex] || defaultJobStatus.logMessage),
    engineLabel:
      payload.engineLabel ||
      payload.progressLabel ||
      (terminalState === 'completed'
        ? 'Generation complete'
        : terminalState === 'failed'
          ? 'Generation interrupted'
          : defaultActiveStep),
    nextLabel:
      payload.nextLabel ||
      payload.nextStep ||
      (terminalState === 'completed'
        ? 'Ready — redirecting to dashboard'
        : terminalState === 'failed'
          ? 'Return to Step 2 and generate again'
          : defaultNextLabels[activeStepIndex] || defaultJobStatus.nextLabel),
    stepsLabel: `${completedStepCount} / 5 steps complete`,
    activeActivityIndex:
      terminalState === 'completed'
        ? -1
        : activityProgressMap[activeStepIndex] ?? 0,
  }
}

const StatusDot = ({ state }: { state: ProgressStepState }) => {
  if (state === 'done') {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--success) dark:bg-(--success)">
        <CheckIcon />
      </span>
    )
  }

  if (state === 'active') {
    return (
      <span className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--brand-500) dark:bg-(--brand-500)">
        <span className="absolute -inset-1 animate-spin rounded-full border-2 border-transparent border-t-(--brand-500) dark:border-t-[#f5a090]" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#fff8ed] dark:bg-(--surface-canvas)" />
      </span>
    )
  }

  return (
    <span className="h-6 w-6 shrink-0 rounded-full bg-[#1a1714]/15 dark:bg-[#f2f0eb]/15" />
  )
}

export default function OnboardingGeneratingPage() {
  const navigate = useNavigate()
  const { jobId } = useParams<{ jobId: string }>()

  const topic = useOnboardingStore(
    (state) => state.step1Data?.topic || 'MERN stack interviews',
  )
  const goal = useOnboardingStore(
    (state) => state.step1Data?.goal || 'Crack top company interviews',
  )
  const level = useOnboardingStore(
    (state) => state.step2Data?.level || 'intermediate',
  )

  const {
    data: jobStatusResponse,
    error: jobStatusError,
  } = useRoadmapJobStatus(jobId)

  const jobStatus = useMemo(() => {
    return normalizeJobStatus(jobStatusResponse?.data)
  }, [jobStatusResponse?.data])

  const statusError =
    jobStatusError?.response?.data?.message ||
    (jobStatusError
      ? 'Unable to read roadmap generation progress.'
      : !jobId
        ? 'Missing roadmap generation job ID.'
        : '')

  useEffect(() => {
    if (jobStatus.terminalState !== 'completed') {
      return
    }

    const timer = window.setTimeout(() => {
      navigate(`/onboarding/roadmap-ready/${jobId}`, {
        replace: true,
      })
    }, 1800)

    return () => {
      window.clearTimeout(timer)
    }
  }, [jobStatus.terminalState, navigate, jobId])

  const visibleLevel = useMemo(() => capitalize(level), [level])

  const stepStates = useMemo(() => {
    return generationSteps.map((_, index): ProgressStepState => {
      if (jobStatus.terminalState === 'completed') {
        return 'done'
      }

      if (jobStatus.terminalState === 'failed') {
        if (index < jobStatus.activeStepIndex) {
          return 'done'
        }

        if (index === jobStatus.activeStepIndex) {
          return 'active'
        }

        return 'pending'
      }

      if (index < jobStatus.activeStepIndex) {
        return 'done'
      }

      if (index === jobStatus.activeStepIndex) {
        return 'active'
      }

      return 'pending'
    })
  }, [jobStatus.activeStepIndex, jobStatus.terminalState])

  return (
    <div className="flex min-h-screen flex-col bg-(--surface-canvas) font-[DM_Sans,sans-serif] text-(--text-primary) dark:bg-(--surface-canvas) dark:text-(--text-primary)">
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-(--border-subtle) bg-(--surface-canvas)/92 px-5 backdrop-blur-xl dark:border-white/15 dark:bg-(--surface-canvas)/94 sm:px-8 md:px-12">
        <OnboardingBrandLink />

        <div className="flex items-center gap-3">
          <span className="hidden rounded-full border border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.08)] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.13em] text-(--brand-500) dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.09)] dark:text-(--brand-500) sm:inline-flex">
            AI Roadmap Generator
          </span>

          
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-260 flex-1 flex-col items-center gap-8 px-4 py-10 sm:px-6 md:px-8 md:py-12">
        <section className="flex flex-col items-center text-center">
          <div className="mb-3 font-mono text-[9.5px] uppercase tracking-[0.16em] text-(--brand-500) dark:text-(--brand-500)">
            AI Roadmap Generator
          </div>

          <h1 className="mb-4 max-w-155 font-serif text-[clamp(32px,6vw,54px)] font-extrabold leading-[1.08] tracking-[-1.5px] text-(--text-primary) dark:text-(--text-primary)">
            Creating your learning roadmap
          </h1>

          <p className="max-w-127.5 text-[15px] leading-[1.65] text-(--text-secondary) dark:text-(--text-secondary)">
            Our AI is analysing your goals and building a personalised path for
            your next learning phase.
          </p>
        </section>

        {statusError && (
          <div
            className="flex w-full items-start gap-2.5 rounded-md border border-[rgba(217,69,53,0.2)] border-l-[3px] border-l-(--danger) bg-[rgba(217,69,53,0.07)] px-4 py-3.5 text-[13px] leading-normal text-(--danger) dark:border-l-(--danger) dark:bg-[rgba(255,107,95,0.10)] dark:text-(--danger)"
            role="alert"
          >
            <span className="mt-0.5">
              <ActivitySparkIcon />
            </span>
            <span>{statusError}</span>
          </div>
        )}

        <section className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
          <article className="rounded-lg border-[1.5px] border-(--border-subtle) bg-(--surface-card) px-5 py-6 shadow-[0_4px_24px_rgba(26,23,20,0.07),0_1px_4px_rgba(26,23,20,0.04)] dark:border-white/15 dark:bg-(--surface-card) dark:shadow-[0_18px_56px_rgba(0,0,0,0.4),0_0_32px_rgba(232,129,106,0.05)] sm:px-6">
            <h2 className="mb-1 font-serif text-[19px] font-bold tracking-[-0.3px] text-(--text-primary) dark:text-(--text-primary)">
              Your learning context
            </h2>

            <p className="mb-5 text-[12.5px] leading-normal text-(--text-secondary) dark:text-(--text-secondary)">
              The AI is using these inputs to personalise your roadmap.
            </p>

            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-3 border-b border-(--border-subtle) py-3 dark:border-white/15">
                <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.13em] text-(--text-secondary)/70 dark:text-(--text-secondary)/70">
                  Field
                </span>

                <span className="max-w-[70%] truncate rounded-md bg-[rgba(184,76,43,0.10)] px-2.75 py-1 text-[12px] font-semibold text-(--brand-500) dark:bg-[rgba(232,129,106,0.12)] dark:text-(--brand-500)">
                  {topic}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 border-b border-(--border-subtle) py-3 dark:border-white/15">
                <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.13em] text-(--text-secondary)/70 dark:text-(--text-secondary)/70">
                  Goal
                </span>

                <span className="max-w-[70%] truncate rounded-md bg-[rgba(184,76,43,0.10)] px-2.75 py-1 text-[12px] font-semibold text-(--brand-500) dark:bg-[rgba(232,129,106,0.12)] dark:text-(--brand-500)">
                  {goal}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 py-3">
                <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.13em] text-(--text-secondary)/70 dark:text-(--text-secondary)/70">
                  Level
                </span>

                <span className="rounded-md bg-[rgba(184,76,43,0.10)] px-2.75 py-1 text-[12px] font-semibold text-(--brand-500) dark:bg-[rgba(232,129,106,0.12)] dark:text-(--brand-500)">
                  {visibleLevel}
                </span>
              </div>
            </div>
          </article>

          <article className="rounded-lg border-[1.5px] border-(--border-subtle) bg-(--surface-card) px-5 py-6 shadow-[0_4px_24px_rgba(26,23,20,0.07),0_1px_4px_rgba(26,23,20,0.04)] dark:border-white/15 dark:bg-(--surface-card) dark:shadow-[0_18px_56px_rgba(0,0,0,0.4),0_0_32px_rgba(232,129,106,0.05)] sm:px-6">
            <h2 className="mb-1 font-serif text-[19px] font-bold tracking-[-0.3px] text-(--text-primary) dark:text-(--text-primary)">
              Generation progress
            </h2>

            <p className="mb-4 text-[12.5px] leading-normal text-(--text-secondary) dark:text-(--text-secondary)">
              Every stage shapes the structure of your personalised learning
              journey.
            </p>

            <div className="flex flex-col gap-2.5" role="list">
              {generationSteps.map((step, index) => {
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
                      isPending &&
                        'border-transparent opacity-45',
                      state === 'done' && 'border-transparent'
                    )}
                  >
                    <StatusDot state={state} />

                    <span
                      className={cn(
                        'text-sm font-medium leading-none text-(--text-primary) dark:text-(--text-primary)',
                        isPending && 'text-(--text-secondary) dark:text-(--text-secondary)'
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
          logMessage={jobStatus.logMessage}
          engineLabel={jobStatus.engineLabel}
          nextLabel={jobStatus.nextLabel}
          progress={jobStatus.progress}
          stepsLabel={jobStatus.stepsLabel}
          progressAriaLabel="Generation progress"
        />

        <OnboardingActivityChips
          chips={activityChips}
          activeActivityIndex={jobStatus.activeActivityIndex}
          completed={jobStatus.terminalState === 'completed'}
          ariaLabel="Current AI activities"
        />

        {jobStatus.terminalState === 'failed' && (
          <button
            type="button"
            onClick={() => navigate('/onboarding/step-2', { replace: true })}
            className="rounded-xl bg-(--brand-500) px-5 py-3 text-sm font-bold text-[#fff8ed] transition hover:-translate-y-px hover:bg-(--brand-600) hover:shadow-[0_6px_22px_rgba(184,76,43,0.30)] active:translate-y-0 active:shadow-none dark:bg-(--brand-500) dark:text-[#141412] dark:hover:bg-(--brand-600)"
          >
            Return to Step 2
          </button>
        )}
      </main>

      <OnboardingWorkflowFooter />

    </div>
  )
}