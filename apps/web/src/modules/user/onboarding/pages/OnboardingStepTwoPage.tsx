// apps/web/src/modules/user/onboarding/pages/OnboardingStepTwoPage.tsx

import { useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSaveOnboardingStepTwo } from '../hooks/useSaveOnboardingStepTwo'

import { useGenerateRoadmap } from '../hooks/useGenerateRoadmap'
import OnboardingBrandLink from '../components/OnboardingBrandLink'
import { levelOptions } from '../constants/onboarding.constants'
import type { Level } from '../types/onboarding.types'
import { cn } from '../utils/cn'
import { useOnboardingStore } from '../store/useOnboardingStore'
import { getInitialLevel } from '../utils/onboarding-storage'

const EditIcon = () => {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

const AlertIcon = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      className={cn('shrink-0', className)}
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

const SparkIcon = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      className={className}
      width="18"
      height="18"
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

const ArrowLeftIcon = () => {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  )
}

const StatueIllustration = () => {
  return (
    <svg
      className="pointer-events-none absolute -right-5 top-5 hidden w-55 select-none text-(--text-primary)/[0.07] dark:text-(--text-primary)/4 md:block"
      viewBox="0 0 200 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <ellipse cx="100" cy="60" rx="36" ry="44" fill="currentColor" />
      <rect x="72" y="98" width="56" height="70" rx="12" fill="currentColor" />
      <ellipse cx="100" cy="168" rx="34" ry="8" fill="currentColor" opacity="0.4" />
      <rect x="80" y="176" width="16" height="60" rx="6" fill="currentColor" />
      <rect x="104" y="176" width="16" height="60" rx="6" fill="currentColor" />
      <rect
        x="36"
        y="104"
        width="14"
        height="50"
        rx="7"
        fill="currentColor"
        transform="rotate(-8 36 104)"
      />
      <rect
        x="150"
        y="104"
        width="14"
        height="50"
        rx="7"
        fill="currentColor"
        transform="rotate(8 150 104)"
      />
      <ellipse cx="84" cy="52" rx="6" ry="7" fill="currentColor" opacity="0.3" />
      <ellipse cx="116" cy="52" rx="6" ry="7" fill="currentColor" opacity="0.3" />
      <path
        d="M88 72 Q100 80 112 72"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
    </svg>
  )
}

const WorkspaceIllustration = () => {
  return (
    <svg
      width="90"
      height="90"
      viewBox="0 0 90 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="10"
        y="20"
        width="70"
        height="50"
        rx="6"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <line x1="10" y1="32" x2="80" y2="32" stroke="currentColor" strokeWidth="1.5" />
      <rect x="18" y="40" width="20" height="14" rx="3" fill="currentColor" opacity="0.3" />
      <rect x="44" y="40" width="28" height="5" rx="2" fill="currentColor" opacity="0.3" />
      <rect x="44" y="49" width="20" height="5" rx="2" fill="currentColor" opacity="0.2" />
      <circle cx="14" cy="26" r="2.5" fill="currentColor" opacity="0.4" />
      <circle cx="21" cy="26" r="2.5" fill="currentColor" opacity="0.4" />
      <circle cx="28" cy="26" r="2.5" fill="currentColor" opacity="0.4" />
    </svg>
  )
}

const RoadmapIllustration = () => {
  return (
    <svg
      width="82"
      height="90"
      viewBox="0 0 82 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="20" cy="20" r="8" fill="currentColor" opacity="0.28" />
      <circle cx="60" cy="42" r="8" fill="currentColor" opacity="0.38" />
      <circle cx="28" cy="68" r="8" fill="currentColor" opacity="0.28" />

      <path
        d="M27 24 C37 27 47 31 54 37"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="4 4"
        opacity="0.5"
      />

      <path
        d="M54 49 C47 56 39 62 34 65"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="4 4"
        opacity="0.5"
      />

      <circle cx="20" cy="20" r="3" fill="currentColor" opacity="0.8" />
      <circle cx="60" cy="42" r="3" fill="currentColor" opacity="0.8" />
      <circle cx="28" cy="68" r="3" fill="currentColor" opacity="0.8" />
    </svg>
  )
}

export default function OnboardingStepTwoPage() {
  const navigate = useNavigate()
  const stepOneDraft = useOnboardingStore((state) => state.step1Data)
  const saveOnboardingStepTwoDraft = useOnboardingStore((state) => state.saveStep2)
  const firstLevelCardRef = useRef<HTMLButtonElement | null>(null)

  const {
    mutate: saveStepTwo,
    isPending: isSavingStepTwo,
    error: saveStepTwoError,
    reset: resetSaveStepTwoError,
  } = useSaveOnboardingStepTwo()

  const {
    mutate: generateRoadmap,
    isPending: isGeneratingRoadmap,
    error: generateRoadmapError,
    reset: resetGenerateRoadmapError,
  } = useGenerateRoadmap()

  const apiError =
    saveStepTwoError?.response?.data?.message ||
    generateRoadmapError?.response?.data?.message ||
    (saveStepTwoError || generateRoadmapError
      ? 'Something went wrong. Please try again.'
      : '')

  const isSubmitting = isSavingStepTwo || isGeneratingRoadmap

  const topic = stepOneDraft?.topic || 'MERN Stack Interviews'
  const goal = stepOneDraft?.goal || 'Crack product company roles'

  const [selectedLevel, setSelectedLevel] = useState<Level>(() => {
    return getInitialLevel()
  })

  const [levelError, setLevelError] = useState('')
  const [summaryHighlight, setSummaryHighlight] = useState(false)
  const [toast, setToast] = useState('')
  const [runInBackground, setRunInBackground] = useState(false)

  const contextText = useMemo(() => {
    return [topic, goal].filter(Boolean).join(' · ')
  }, [topic, goal])

  const showToast = (message: string) => {
    setToast(message)

    window.setTimeout(() => {
      setToast('')
    }, 2600)
  }

  const clearMutationError = () => {
    if (saveStepTwoError) {
      resetSaveStepTwoError()
    }

    if (generateRoadmapError) {
      resetGenerateRoadmapError()
    }
  }

  const pulseSummary = () => {
    setSummaryHighlight(true)

    window.setTimeout(() => {
      setSummaryHighlight(false)
    }, 800)
  }

  const handleSelectLevel = (level: Level) => {
    clearMutationError()
    setSelectedLevel(level)
    setLevelError('')
    pulseSummary()
  }

  const validate = () => {
    if (!selectedLevel) {
      setLevelError('Please select your current level to continue.')
      firstLevelCardRef.current?.focus()
      return false
    }

    setLevelError('')
    return true
  }

  const handleBack = () => {
    if (isSubmitting) return
    navigate('/onboarding/step-1')
  }

  const handleGenerate = () => {
    if (!validate()) return

    clearMutationError()

    saveOnboardingStepTwoDraft({ level: selectedLevel })

    saveStepTwo(
      {
        level: selectedLevel,
      },
      {
        onSuccess: () => {
          generateRoadmap(
            {
              topic: topic.trim(),
              goal: goal.trim() || undefined,
              level: selectedLevel,
            },
            {
              onSuccess: (response) => {
                const jobId = response.data?.jobId

                if (!jobId) {
                  showToast(
                    'Roadmap generation started, but no job ID was returned.'
                  )
                  return
                }

                if (runInBackground) {
                  showToast('Tracker generation is running in the background. We will notify you when it is ready.')
                  navigate('/dashboard', { replace: true })
                } else {
                  navigate(`/onboarding/generating/${jobId}`, { replace: true })
                }
              },
            }
          )
        },
      }
    )
  }

  const handleLevelKeyDown = (
    e: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number
  ) => {
    if (
      e.key !== 'ArrowDown' &&
      e.key !== 'ArrowRight' &&
      e.key !== 'ArrowUp' &&
      e.key !== 'ArrowLeft'
    ) {
      return
    }

    e.preventDefault()

    const direction =
      e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1

    const nextIndex =
      (currentIndex + direction + levelOptions.length) % levelOptions.length

    const nextLevel = levelOptions[nextIndex]?.value

    if (nextLevel) {
      handleSelectLevel(nextLevel)

      const nextElement = document.getElementById(
        `level-card-${nextLevel}`
      ) as HTMLButtonElement | null

      nextElement?.focus()
    }
  }

  const levelCardClass = (selected: boolean) =>
    cn(
      'group relative flex w-full items-start gap-4 overflow-hidden rounded-[16px] border-[1.5px] px-5 py-5 text-left transition',
      'border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[0_6px_32px_rgba(26,23,20,0.07),0_1px_6px_rgba(26,23,20,0.04)]',
      'hover:-translate-y-px hover:border-[var(--brand-500)] hover:shadow-[0_8px_28px_rgba(184,76,43,0.09)]',
      'disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0',
      'dark:border-white/15 dark:bg-[var(--surface-card)] dark:shadow-[0_18px_60px_rgba(0,0,0,0.45),0_0_40px_rgba(232,129,106,0.05)]',
      'dark:hover:border-[#f5a090]',
      selected &&
        'border-[var(--brand-500)] bg-[rgba(184,76,43,0.06)] shadow-[0_6px_28px_rgba(184,76,43,0.18)] dark:border-[var(--brand-500)] dark:bg-[rgba(232,129,106,0.08)] dark:shadow-[0_8px_36px_rgba(232,129,106,0.22)]'
    )

  const levelBadgeClass = (level: Level) =>
    cn(
      'inline-flex items-center rounded px-2 py-0.75 font-mono text-[8.5px] font-medium uppercase tracking-[0.1em]',
      level === 'beginner' &&
        'bg-[rgba(76,175,125,0.10)] text-[#2d8a5e] dark:bg-[rgba(92,201,138,0.12)] dark:text-[var(--success)]',
      level === 'intermediate' &&
        'bg-[rgba(232,129,106,0.14)] text-[var(--brand-500)] dark:bg-[rgba(232,129,106,0.16)] dark:text-[var(--brand-500)]',
      level === 'advanced' &&
        'bg-[rgba(90,100,200,0.10)] text-[#4a56b5] dark:bg-[rgba(140,148,240,0.14)] dark:text-[#8c94f0]'
    )

  const buttonLabel = isSavingStepTwo
    ? 'Saving your level…'
    : isGeneratingRoadmap
      ? 'Starting roadmap generation…'
      : 'Generate my roadmap'

  return (
    <div className="flex min-h-screen flex-col bg-(--surface-canvas) pb-24 font-[DM_Sans,sans-serif] text-(--text-primary) dark:bg-(--surface-canvas) dark:text-(--text-primary)">
      <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between border-b border-transparent bg-(--surface-canvas)/95 px-5 py-4 backdrop-blur-xl dark:bg-(--surface-canvas)/95 sm:px-8 md:px-12">
        <OnboardingBrandLink
          logoClassName="h-8.5 w-8.5 rounded-[var(--radius-sm)]"
          wordmarkClassName="text-[20px]"
        />

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3" aria-label="Step 2 of 2">
            <span className="hidden font-mono text-[9.5px] uppercase tracking-[0.12em] text-(--text-secondary) dark:text-(--text-secondary) sm:inline">
              Step 2 of 2
            </span>

            <span className="hidden h-3.5 w-px bg-(--border-subtle) dark:bg-white/15 sm:block" />

            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="hidden max-w-45 truncate font-mono text-[9px] tracking-[0.06em] text-(--text-secondary)/70 transition hover:text-(--brand-500) disabled:cursor-not-allowed disabled:opacity-60 dark:text-(--text-secondary)/70 dark:hover:text-(--brand-500) md:block"
            >
              Previous: {topic || 'Goal Selection'}
            </button>
          </div>

          
        </div>
      </header>

      <div
        className="h-0.75 w-full bg-[rgba(184,76,43,0.12)] dark:bg-[rgba(232,129,106,0.14)]"
        role="progressbar"
        aria-valuenow={100}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Step 2 of 2 complete"
      >
        <div className="h-full w-full rounded-r-sm bg-(--brand-500) dark:bg-(--brand-500)" />
      </div>

      <main className="relative mx-auto flex w-full max-w-185 flex-1 flex-col items-center px-4 py-8 sm:px-6 sm:py-10 md:py-13">
        <StatueIllustration />

        <button
          type="button"
          onClick={handleBack}
          disabled={isSubmitting}
          aria-label="Edit topic and goal"
          className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full border border-[rgba(26,23,20,0.12)] bg-[rgba(26,23,20,0.05)] px-4 py-2 font-mono text-[9.5px] uppercase tracking-[0.12em] text-(--text-primary) transition hover:border-(--brand-500) hover:bg-[rgba(184,76,43,0.08)] disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/15 dark:bg-white/6 dark:text-(--text-secondary) dark:hover:border-[#f5a090] dark:hover:bg-[rgba(232,129,106,0.09)]"
        >
          <span className="truncate">{contextText}</span>
          <span className="shrink-0 text-(--text-secondary)/70 dark:text-(--text-secondary)/70">
            <EditIcon />
          </span>
        </button>

        <h1 className="mb-3 max-w-155 text-center font-serif text-[clamp(26px,5.5vw,42px)] font-extrabold leading-[1.1] tracking-[-1px] text-(--text-primary) dark:text-(--text-primary)">
          How would you describe your current level?
        </h1>

        <p className="mb-9 max-w-125 text-center text-sm leading-[1.65] text-(--text-secondary) dark:text-(--text-secondary)">
          Select the stage that best represents your familiarity with the
          subject matter to customise your learning path.
        </p>

        {apiError && (
          <div
            className="mb-5 flex w-full items-start gap-2.5 rounded-xl border border-[rgba(217,69,53,0.2)] border-l-[3px] border-l-(--danger) bg-[rgba(217,69,53,0.07)] px-3.5 py-3 text-[13px] leading-normal text-(--danger) dark:border-l-(--danger) dark:bg-[rgba(255,107,95,0.10)] dark:text-(--danger)"
            role="alert"
          >
            <AlertIcon className="mt-0.5 h-3.5 w-3.5" />
            <span>{apiError}</span>
          </div>
        )}

        <section
          className="mb-3 flex w-full flex-col gap-3"
          role="radiogroup"
          aria-label="Select your current level"
        >
          {levelOptions.map((option, index) => {
            const selected = selectedLevel === option.value

            return (
              <button
                key={option.value}
                id={`level-card-${option.value}`}
                ref={index === 0 ? firstLevelCardRef : undefined}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={isSubmitting}
                onClick={() => handleSelectLevel(option.value)}
                onKeyDown={(e) => handleLevelKeyDown(e, index)}
                className={levelCardClass(selected)}
              >
                <span className="pointer-events-none absolute -left-full top-0 h-full w-1/2 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)] transition-[left] duration-700 group-hover:left-[160%]" />

                <span
                  className={cn(
                    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition',
                    selected
                      ? 'border-(--brand-500) bg-(--brand-500) dark:border-(--brand-500) dark:bg-(--brand-500)'
                      : 'border-(--border-subtle) bg-transparent dark:border-white/15'
                  )}
                >
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full bg-white transition dark:bg-(--surface-canvas)',
                      selected
                        ? 'scale-100 opacity-100'
                        : 'scale-0 opacity-0'
                    )}
                  />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="mb-2 flex flex-wrap items-center gap-2.5">
                    <span className={levelBadgeClass(option.value)}>
                      {option.badge}
                    </span>

                    <span className="font-serif text-[20px] font-bold leading-none tracking-[-0.3px] text-(--text-primary) dark:text-(--text-primary)">
                      {option.title}
                    </span>
                  </span>

                  <span className="block text-[13.5px] leading-[1.6] text-(--text-secondary) dark:text-(--text-secondary)">
                    {option.description}
                  </span>
                </span>
              </button>
            )
          })}
        </section>

        {levelError && (
          <div
            className="mb-8 mt-1 flex w-full items-center gap-1.5 text-[11.5px] text-(--danger) dark:text-(--danger)"
            role="alert"
            aria-live="polite"
          >
            <AlertIcon />
            <span>{levelError}</span>
          </div>
        )}

        {!levelError && <div className="mb-8" />}

        <section
          className={cn(
            'mb-8 flex w-full items-start gap-3.5 rounded-2xl border-[1.5px] px-5 py-4.5 shadow-[0_6px_32px_rgba(26,23,20,0.07),0_1px_6px_rgba(26,23,20,0.04)] transition',
            'border-(--border-subtle) bg-(--surface-card) dark:border-white/15 dark:bg-(--surface-card) dark:shadow-[0_18px_60px_rgba(0,0,0,0.45),0_0_40px_rgba(232,129,106,0.05)]',
            summaryHighlight &&
              'border-(--brand-500) dark:border-[#f5a090]'
          )}
          role="status"
          aria-live="polite"
        >
          <div className="flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-md border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] text-(--brand-500) dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.09)] dark:text-(--brand-500)">
            <SparkIcon className="animate-spin [animation-duration:6s]" />
          </div>

          <p className="text-[13.5px] leading-[1.65] text-(--text-primary) dark:text-(--text-primary)">
            “Based on your answers, your roadmap will be calibrated for your{' '}
            <strong className="font-semibold capitalize text-(--brand-500) dark:text-(--brand-500)">
              {selectedLevel}
            </strong>{' '}
            level, with a personalized learning path shaped around your goal and
            current preparation stage.”
          </p>
        </section>

        <section className="mb-2 flex w-full gap-3.5" aria-hidden="true">
          <div className="flex min-h-30 flex-1 items-center justify-center overflow-hidden rounded-md border border-(--border-subtle) bg-(--surface-card) text-(--text-primary)/35 shadow-[0_6px_32px_rgba(26,23,20,0.07),0_1px_6px_rgba(26,23,20,0.04)] dark:border-white/15 dark:bg-(--surface-card) dark:text-(--text-primary)/35">
            <WorkspaceIllustration />
          </div>

          <div className="flex min-h-30 w-[38%] items-center justify-center overflow-hidden rounded-md border border-(--border-subtle) bg-(--surface-card) text-(--text-primary)/35 shadow-[0_6px_32px_rgba(26,23,20,0.07),0_1px_6px_rgba(26,23,20,0.04)] dark:border-white/15 dark:bg-(--surface-card) dark:text-(--text-primary)/35">
            <RoadmapIllustration />
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between gap-3 border-t border-(--border-subtle) bg-(--surface-canvas)/94 px-4 py-3.5 backdrop-blur-xl dark:border-white/15 dark:bg-(--surface-canvas)/94 sm:px-8 md:px-12">
        <button
          type="button"
          onClick={handleBack}
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.75 py-2 text-[13px] font-medium text-(--text-secondary) transition hover:text-(--text-primary) disabled:cursor-not-allowed disabled:opacity-60 dark:text-(--text-secondary) dark:hover:text-[#f2f0eb]"
        >
          <ArrowLeftIcon />
          Back
        </button>

        <div className="flex shrink-0 items-center gap-3.5">
          <label className="hidden cursor-pointer items-center gap-2 text-xs text-(--text-secondary) sm:flex">
            <input
              type="checkbox"
              checked={runInBackground}
              onChange={(event) => setRunInBackground(event.target.checked)}
              disabled={isSubmitting}
              className="accent-(--brand-500)"
            />
            Run in background
          </label>
          <div className="hidden flex-col items-end gap-0.5 md:flex" aria-hidden="true">
            <span className="font-mono text-[8.5px] uppercase tracking-widest text-(--text-secondary)/70 dark:text-(--text-secondary)/70">
              Final Step
            </span>

            <span className="font-mono text-[10px] italic tracking-[0.06em] text-(--text-secondary) dark:text-(--text-secondary)">
              Generate Strategy
            </span>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isSubmitting}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-(--brand-500) px-5.5 py-3 text-sm font-bold text-[#fff8ed] transition hover:-translate-y-px hover:bg-(--brand-600) hover:shadow-[0_6px_22px_rgba(184,76,43,0.30)] active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none dark:bg-(--brand-500) dark:text-[#141412] dark:hover:bg-(--brand-600)"
          >
            <span className="pointer-events-none absolute -left-full top-0 h-full w-[55%] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent)] transition-[left] duration-700 group-hover:left-[160%]" />

            {buttonLabel}

            <SparkIcon
              className={cn(
                'h-4 w-4 shrink-0',
                isSubmitting
                  ? 'animate-spin [animation-duration:0.6s]'
                  : 'animate-spin [animation-duration:3s]'
              )}
            />
          </button>
        </div>
      </div>

      {toast && (
        <div
          className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#1a1714] px-4.5 py-2.5 text-[12.5px] font-medium text-[#f5ede4] shadow-lg dark:bg-[#f2f0eb] dark:text-[#141412]"
          role="status"
          aria-live="polite"
        >
          {toast}
        </div>
      )}
    </div>
  )
}
