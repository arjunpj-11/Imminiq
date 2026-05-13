// apps/web/src/modules/onboarding/pages/OnboardingGeneratingPage.tsx

import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ThemeToggle from '../../../components/ui/ThemeToggle'
import { useRoadmapJobStatus } from '../../../hooks/onboarding/useRoadmapJobStatus'

type JobTerminalState = 'completed' | 'failed' | null

type ProgressStepState = 'done' | 'active' | 'pending'

interface JobStatusApiData {
  jobId?: string
  status?: string
  state?: string
  progress?: number
  progressPercent?: number
  percentage?: number
  currentStep?: number
  step?: number
  completedSteps?: number
  completedStep?: number
  totalSteps?: number
  stepLabel?: string
  currentStepLabel?: string
  progressLabel?: string
  message?: string
  logMessage?: string
  engineLabel?: string
  nextLabel?: string
  nextStep?: string
}

interface NormalizedJobStatus {
  progress: number
  activeStepIndex: number
  terminalState: JobTerminalState
  logMessage: string
  engineLabel: string
  nextLabel: string
  stepsLabel: string
  activeActivityIndex: number
}

type GenerationStep = {
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

const generationSteps: GenerationStep[] = [
  {
    label: 'Analysing goal',
    activeLabel: 'Analysing goal…',
  },
  {
    label: 'Mapping topics',
    activeLabel: 'Mapping topics…',
  },
  {
    label: 'Structuring roadmap',
    activeLabel: 'Structuring roadmap…',
  },
  {
    label: 'Adding resources',
    activeLabel: 'Adding resources…',
  },
  {
    label: 'Finalising',
    activeLabel: 'Finalising…',
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
    if (rawStep >= 1 && rawStep <= 5) {
      return rawStep - 1
    }

    if (rawStep >= 0 && rawStep <= 4) {
      return rawStep
    }
  }

  return fallbackPhaseByProgress(progress)
}

const clampProgress = (value: number) => {
  return Math.min(100, Math.max(0, Math.round(value)))
}

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

const LogoIcon = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      className={cn('block shrink-0 rounded-xl', className)}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="10" y="10" width="80" height="80" rx="18" fill="#050505" />

      <g transform="translate(-5, 1)">
        <rect x="31" y="35" width="9" height="34" rx="4.5" fill="#fff8ed" />
        <circle cx="35.5" cy="28.5" r="5.3" fill="#f15a35" />

        <path
          d="M64 32.8 C73.8 34.7 79.5 42.2 79.5 51.5 C79.5 61.8 71.2 68 60.2 68 C53.2 68 48.2 65.5 45.1 60.8"
          fill="none"
          stroke="#fff8ed"
          strokeWidth="9"
          strokeLinecap="round"
        />

        <line
          x1="63.8"
          y1="55.5"
          x2="75.8"
          y2="67.5"
          stroke="#f15a35"
          strokeWidth="9"
          strokeLinecap="round"
        />
      </g>
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

const defaultJobStatus: NormalizedJobStatus = {
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

const normalizeJobStatus = (
  payload: JobStatusApiData | undefined
): NormalizedJobStatus => {
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

  const progress = clampProgress(
    payload.progress ??
      payload.progressPercent ??
      payload.percentage ??
      (terminalState === 'completed' ? 100 : defaultJobStatus.progress)
  )

  const completedSteps =
    payload.completedSteps ?? payload.completedStep ?? undefined

  const activeStepIndex = normalizeStepIndex(
    payload.currentStep ?? payload.step,
    completedSteps,
    progress
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

export default function OnboardingGeneratingPage() {
  const navigate = useNavigate()
  const { jobId } = useParams<{ jobId: string }>()

  const [topic] = useState(() => {
  return (
    sessionStorage.getItem('imminiq_topic') ||
    sessionStorage.getItem('imminiq_draft_topic') ||
    'MERN stack interviews'
  )
})

const [goal] = useState(() => {
  return (
    sessionStorage.getItem('imminiq_goal') ||
    sessionStorage.getItem('imminiq_draft_goal') ||
    'Crack top company interviews'
  )
})

const [level] = useState(() => {
  return sessionStorage.getItem('imminiq_level') || 'intermediate'
})
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
  }, [jobStatus.terminalState, navigate])

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
    <div className="flex min-h-screen flex-col bg-[#f5ede4] font-[DM_Sans,sans-serif] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]">
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#e0d0c5] bg-[#f5ede4]/92 px-5 backdrop-blur-xl dark:border-white/15 dark:bg-[#141412]/94 sm:px-8 md:px-12">
        <Link to="/" className="inline-flex items-center gap-2.5 leading-none">
          <LogoIcon className="h-8 w-8 rounded-[8px]" />

          <span className="text-[19px] font-bold leading-none tracking-[-0.5px] text-[#1a1714] dark:text-[#f2f0eb]">
            immin
            <span className="text-[#b84c2b] dark:text-[#e8816a]">iq</span>
            <span className="text-[#b84c2b] dark:text-[#e8816a]">.</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden rounded-full border border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.08)] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.13em] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.09)] dark:text-[#e8816a] sm:inline-flex">
            AI Roadmap Generator
          </span>

          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1040px] flex-1 flex-col items-center gap-8 px-4 py-10 sm:px-6 md:px-8 md:py-12">
        <section className="flex flex-col items-center text-center">
          <div className="mb-3 font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#b84c2b] dark:text-[#e8816a]">
            AI Roadmap Generator
          </div>

          <h1 className="mb-4 max-w-[620px] font-serif text-[clamp(32px,6vw,54px)] font-extrabold leading-[1.08] tracking-[-1.5px] text-[#1a1714] dark:text-[#f2f0eb]">
            Creating your learning roadmap
          </h1>

          <p className="max-w-[510px] text-[15px] leading-[1.65] text-[#6b5f58] dark:text-[#9b9a92]">
            Our AI is analysing your goals and building a personalised path for
            your next learning phase.
          </p>
        </section>

        {statusError && (
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

        <section className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
          <article className="rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] px-5 py-6 shadow-[0_4px_24px_rgba(26,23,20,0.07),0_1px_4px_rgba(26,23,20,0.04)] dark:border-white/15 dark:bg-[#1e1c19] dark:shadow-[0_18px_56px_rgba(0,0,0,0.4),0_0_32px_rgba(232,129,106,0.05)] sm:px-6">
            <h2 className="mb-1 font-serif text-[19px] font-bold tracking-[-0.3px] text-[#1a1714] dark:text-[#f2f0eb]">
              Your learning context
            </h2>

            <p className="mb-5 text-[12.5px] leading-[1.5] text-[#6b5f58] dark:text-[#9b9a92]">
              The AI is using these inputs to personalise your roadmap.
            </p>

            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-3 border-b border-[#e0d0c5] py-3 dark:border-white/15">
                <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.13em] text-[#6b5f58]/70 dark:text-[#9b9a92]/70">
                  Field
                </span>

                <span className="max-w-[70%] truncate rounded-md bg-[rgba(184,76,43,0.10)] px-2.75 py-1 text-[12px] font-semibold text-[#b84c2b] dark:bg-[rgba(232,129,106,0.12)] dark:text-[#e8816a]">
                  {topic}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 border-b border-[#e0d0c5] py-3 dark:border-white/15">
                <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.13em] text-[#6b5f58]/70 dark:text-[#9b9a92]/70">
                  Goal
                </span>

                <span className="max-w-[70%] truncate rounded-md bg-[rgba(184,76,43,0.10)] px-2.75 py-1 text-[12px] font-semibold text-[#b84c2b] dark:bg-[rgba(232,129,106,0.12)] dark:text-[#e8816a]">
                  {goal}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 py-3">
                <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.13em] text-[#6b5f58]/70 dark:text-[#9b9a92]/70">
                  Level
                </span>

                <span className="rounded-md bg-[rgba(184,76,43,0.10)] px-2.75 py-1 text-[12px] font-semibold text-[#b84c2b] dark:bg-[rgba(232,129,106,0.12)] dark:text-[#e8816a]">
                  {visibleLevel}
                </span>
              </div>
            </div>
          </article>

          <article className="rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] px-5 py-6 shadow-[0_4px_24px_rgba(26,23,20,0.07),0_1px_4px_rgba(26,23,20,0.04)] dark:border-white/15 dark:bg-[#1e1c19] dark:shadow-[0_18px_56px_rgba(0,0,0,0.4),0_0_32px_rgba(232,129,106,0.05)] sm:px-6">
            <h2 className="mb-1 font-serif text-[19px] font-bold tracking-[-0.3px] text-[#1a1714] dark:text-[#f2f0eb]">
              Generation progress
            </h2>

            <p className="mb-4 text-[12.5px] leading-[1.5] text-[#6b5f58] dark:text-[#9b9a92]">
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
                      'flex items-center gap-3 rounded-[12px] border-[1.5px] px-3.5 py-2.5 transition',
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

        <section
          className="w-full rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] px-5 py-5 shadow-[0_4px_24px_rgba(26,23,20,0.07),0_1px_4px_rgba(26,23,20,0.04)] dark:border-white/15 dark:bg-[#1e1c19] dark:shadow-[0_18px_56px_rgba(0,0,0,0.4),0_0_32px_rgba(232,129,106,0.05)] sm:px-6"
          aria-live="polite"
          aria-atomic="true"
        >
          <p className="mb-4 min-h-[48px] text-[16px] font-semibold leading-[1.5] text-[#1a1714] dark:text-[#f2f0eb]">
            {jobStatus.logMessage}
          </p>

          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-[#6b5f58]/60 dark:text-[#9b9a92]/60">
              {jobStatus.engineLabel}
            </span>

            <span className="font-mono text-[8.5px] uppercase tracking-[0.13em] text-[#6b5f58]/60 dark:text-[#9b9a92]/60">
              {jobStatus.nextLabel}
            </span>
          </div>

          <div
            className="relative mb-2 h-[5px] w-full overflow-hidden rounded-full bg-[#1a1714]/[0.08] dark:bg-[#f2f0eb]/[0.10]"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={jobStatus.progress}
            aria-label="Generation progress"
          >
            <div
              className="relative h-full overflow-hidden rounded-full bg-[#b84c2b] transition-[width] duration-1000 ease-out dark:bg-[#e8816a]"
              style={{ width: `${jobStatus.progress}%` }}
            >
              <span className="absolute inset-y-0 left-0 w-[60%] animate-[roadmapShimmer_1.6s_ease-in-out_infinite] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)]" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-[#6b5f58]/45 dark:text-[#9b9a92]/45">
              {jobStatus.progress}% complete
            </span>

            <span className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-[#6b5f58]/60 dark:text-[#9b9a92]/60">
              {jobStatus.stepsLabel}
            </span>
          </div>
        </section>

        <section
          className="flex w-full flex-wrap justify-center gap-2.25"
          role="list"
          aria-label="Current AI activities"
        >
          {activityChips.map((chip, index) => {
            const active =
              jobStatus.terminalState !== 'completed' &&
              index === jobStatus.activeActivityIndex

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

        {jobStatus.terminalState === 'failed' && (
          <button
            type="button"
            onClick={() => navigate('/onboarding/step-2', { replace: true })}
            className="rounded-[12px] bg-[#b84c2b] px-5 py-3 text-sm font-bold text-[#fff8ed] transition hover:-translate-y-px hover:bg-[#963d22] hover:shadow-[0_6px_22px_rgba(184,76,43,0.30)] active:translate-y-0 active:shadow-none dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]"
          >
            Return to Step 2
          </button>
        )}
      </main>

      <footer className="flex w-full flex-wrap items-center justify-between gap-3 border-t border-[#e0d0c5] bg-[#f5ede4] px-5 py-5 dark:border-white/15 dark:bg-[#141412] sm:px-8 md:px-12">
        <span className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-[#6b5f58]/50 dark:text-[#9b9a92]/50">
          © 2026 Imminiq. Scholarly rigor meets digital intelligence.
        </span>

        <div className="flex items-center gap-4">
          <Link
            to="/privacy"
            className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-[#6b5f58]/50 transition hover:text-[#b84c2b] hover:opacity-100 dark:text-[#9b9a92]/50 dark:hover:text-[#e8816a]"
          >
            Privacy
          </Link>

          <Link
            to="/terms"
            className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-[#6b5f58]/50 transition hover:text-[#b84c2b] hover:opacity-100 dark:text-[#9b9a92]/50 dark:hover:text-[#e8816a]"
          >
            Terms
          </Link>
        </div>
      </footer>

      <style>{`
        @keyframes roadmapShimmer {
          0% {
            transform: translateX(-100%);
          }

          100% {
            transform: translateX(400%);
          }
        }
      `}</style>
    </div>
  )
}