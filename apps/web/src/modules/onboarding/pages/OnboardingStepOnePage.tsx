// apps/web/src/modules/onboarding/pages/OnboardingStepOnePage.tsx

import { useMemo, useState } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import OnboardingBrandLink from '../components/OnboardingBrandLink'
import {
  goalChips,
  roadmapPreviewMap,
  topicChips,
} from '../constants/onboarding.constants'
import { useSaveOnboardingStepOne } from '../hooks/useSaveOnboardingStepOne'
import { useOnboardingStore } from '../store/useOnboardingStore'
import type { PendingAction } from '../types/onboarding.types'
import { cn } from '../utils/cn'

const SearchIcon = () => {
  return (
    <svg
      width="16"
      height="16"
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

const CloseIcon = () => {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

const CheckIcon = () => {
  return (
    <svg
      width="7"
      height="7"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <polyline points="2,6 5,9 10,3" />
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

const FlagIcon = () => {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  )
}

const LockIcon = () => {
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
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  )
}

const ArrowLeftIcon = () => {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  )
}

const ArrowRightIcon = () => {
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
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

export default function OnboardingStepOnePage() {
  const navigate = useNavigate()
  const savedStepOne = useOnboardingStore((state) => state.step1Data)
  const saveOnboardingDraft = useOnboardingStore((state) => state.saveStep1)

  const {
    mutate: saveStepOne,
    isPending,
    error,
    reset,
  } = useSaveOnboardingStepOne()

  const apiError =
    error?.response?.data?.message ||
    (error ? 'Failed to save onboarding details. Please try again.' : '')

  const [topic, setTopic] = useState(() => savedStepOne?.topic ?? '')

  const [goal, setGoal] = useState(() => savedStepOne?.goal ?? '')

  const [selectedTopicChip, setSelectedTopicChip] = useState<string | null>(
    () => topicChips.find((chip) => chip === savedStepOne?.topic) || null,
  )

  const [selectedGoalChip, setSelectedGoalChip] = useState<string | null>(
    () => goalChips.find((chip) => chip === savedStepOne?.goal) || null,
  )

  const [topicError, setTopicError] = useState('')
  const [toast, setToast] = useState('')
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)

  const previewItems = useMemo(() => {
    const trimmedTopic = topic.trim().toLowerCase()

    if (!trimmedTopic) {
      return roadmapPreviewMap.default
    }

    const matchedKey = Object.keys(roadmapPreviewMap).find((key) => {
      if (key === 'default') return false

      return trimmedTopic.includes(key.toLowerCase())
    })

    return matchedKey
      ? roadmapPreviewMap[matchedKey]
      : roadmapPreviewMap.default
  }, [topic])

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/', {
      replace: true,
    })
  }

  const showToast = (message: string) => {
    setToast(message)

    window.setTimeout(() => {
      setToast('')
    }, 2200)
  }

  const clearMutationError = () => {
    if (error) {
      reset()
    }
  }

  const handleTopicChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    clearMutationError()
    setTopic(value)
    setTopicError('')

    const exactChip = topicChips.find((chip) => chip === value.trim())
    setSelectedTopicChip(exactChip || null)
  }

  const handleGoalChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value

    clearMutationError()
    setGoal(value)

    const exactChip = goalChips.find((chip) => chip === value.trim())
    setSelectedGoalChip(exactChip || null)
  }

  const handleSelectTopicChip = (chip: string) => {
    clearMutationError()

    if (selectedTopicChip === chip) {
      setSelectedTopicChip(null)
      setTopic('')
      setTopicError('')
      return
    }

    setSelectedTopicChip(chip)
    setTopic(chip)
    setTopicError('')
  }

  const handleSelectGoalChip = (chip: string) => {
    clearMutationError()

    if (selectedGoalChip === chip) {
      setSelectedGoalChip(null)
      setGoal('')
      return
    }

    setSelectedGoalChip(chip)
    setGoal(chip)
  }

  const handleClearTopic = () => {
    clearMutationError()
    setTopic('')
    setSelectedTopicChip(null)
    setTopicError('')
  }

  const validate = () => {
    if (!topic.trim()) {
      setTopicError("Tell us what you're preparing for to continue.")
      return false
    }

    setTopicError('')
    return true
  }

  const handleSaveDraft = () => {
    if (!validate()) return

    setPendingAction('draft')

    saveOnboardingDraft({ topic: topic.trim(), goal: goal.trim() })

    saveStepOne(
      {
        topic: topic.trim(),
        goal: goal.trim() || undefined,
      },
      {
        onSuccess: () => {
          showToast('Draft saved ✓')
        },
        onSettled: () => {
          setPendingAction(null)
        },
      }
    )
  }

  const handleContinue = () => {
    if (!validate()) return

    setPendingAction('continue')

    saveOnboardingDraft({ topic: topic.trim(), goal: goal.trim() })

    saveStepOne(
      {
        topic: topic.trim(),
        goal: goal.trim() || undefined,
      },
      {
        onSuccess: () => {
          navigate('/onboarding/step-2')
        },
        onSettled: () => {
          setPendingAction(null)
        },
      }
    )
  }

  const handleMainKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const target = e.target as HTMLElement

    if (e.key === 'Enter' && target.tagName === 'INPUT') {
      e.preventDefault()
      handleContinue()
    }
  }

  const goalLength = goal.length

  const charCountClass =
    goalLength > 380
      ? 'text-[var(--danger)] opacity-100 dark:text-[var(--danger)]'
      : goalLength > 320
        ? 'text-[#f0a500] opacity-100 dark:text-[var(--warning)]'
        : 'text-[var(--text-secondary)]/60 dark:text-[var(--text-secondary)]/60'

  const chipClass = (selected: boolean) =>
    cn(
      'inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-3.5 py-1.75 text-[12.5px] font-medium transition',
      'border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-primary)]',
      'hover:-translate-y-px hover:border-[var(--brand-500)] hover:bg-[rgba(184,76,43,0.07)] hover:text-[var(--brand-500)]',
      'hover:shadow-[0_3px_12px_rgba(184,76,43,0.09)]',
      'dark:border-white/15 dark:bg-[var(--surface-card)] dark:text-[var(--text-primary)]',
      'dark:hover:border-[#f5a090] dark:hover:bg-[rgba(232,129,106,0.08)] dark:hover:text-[var(--brand-500)]',
      selected &&
        'border-[var(--brand-500)] bg-[rgba(184,76,43,0.12)] text-[var(--brand-500)] dark:border-[var(--brand-500)] dark:bg-[rgba(232,129,106,0.15)] dark:text-[var(--brand-500)]'
    )

  return (
    <div className="flex min-h-screen flex-col bg-(--surface-canvas) pb-24 font-[DM_Sans,sans-serif] text-(--text-primary) dark:bg-(--surface-canvas) dark:text-(--text-primary)">
      <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between border-b border-transparent bg-(--surface-canvas)/95 px-5 py-4 backdrop-blur-xl dark:bg-(--surface-canvas)/95 sm:px-8 md:px-12">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Go back to previous page"
            title="Go back"
            className={cn(
              'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md',
              'border border-(--border-subtle) bg-(--surface-card) text-(--text-secondary)',
              'transition hover:-translate-x-0.5 hover:border-(--brand-500)',
              'hover:bg-[rgba(184,76,43,0.08)] hover:text-(--brand-500)',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-500)/30',
              'dark:border-white/15 dark:bg-(--surface-card) dark:text-(--text-secondary)',
              'dark:hover:border-(--brand-500) dark:hover:bg-[rgba(232,129,106,0.09)]',
              'dark:hover:text-(--brand-500) dark:focus-visible:ring-(--brand-500)/30'
            )}
          >
            <ArrowLeftIcon />
          </button>

          <OnboardingBrandLink
            logoClassName="h-8.5 w-8.5 rounded-[var(--radius-sm)]"
            wordmarkClassName="text-[20px]"
            hideWordmarkOnMobile
          />
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3" aria-label="Step 1 of 2">
            <span className="hidden font-mono text-[9.5px] uppercase tracking-[0.12em] text-(--text-secondary) dark:text-(--text-secondary) sm:inline">
              Step 1 of 2
            </span>

            <div className="flex items-center gap-1.25" aria-hidden="true">
              <span className="h-1.75 w-1.75 rounded-full bg-(--brand-500) dark:bg-(--brand-500)" />
              <span className="h-1.5 w-1.5 rounded-full bg-(--border-subtle) dark:bg-white/15" />
            </div>
          </div>
        </div>
      </header>

      <div
        className="h-0.75 w-full bg-[rgba(184,76,43,0.12)] dark:bg-[rgba(232,129,106,0.14)]"
        role="progressbar"
        aria-valuenow={50}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Step 1 of 2"
      >
        <div className="h-full w-1/2 rounded-r-sm bg-(--brand-500) dark:bg-(--brand-500)" />
      </div>

      <main
        className="mx-auto flex w-full max-w-175 flex-1 flex-col items-center px-4 py-8 sm:px-6 sm:py-10 md:py-13"
        onKeyDown={handleMainKeyDown}
      >
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-3 py-1.25 font-mono text-[9.5px] font-medium uppercase tracking-widest text-(--brand-500) dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.09)] dark:text-(--brand-500)">
          <span className="h-1.25 w-1.25 rounded-full bg-(--brand-500) dark:bg-(--brand-500)" />
          Let&apos;s build your roadmap
        </div>

        <h1 className="mb-2.5 text-center font-serif text-[clamp(26px,6vw,44px)] font-extrabold leading-[1.1] tracking-[-1px] text-(--text-primary) dark:text-(--text-primary)">
          What are you preparing for?
        </h1>

        <p className="mb-8 max-w-105 text-center text-sm leading-[1.6] text-(--text-secondary) dark:text-(--text-secondary)">
          Tell us anything — exam, skill, role, or subject. We&apos;ll craft a
          roadmap built for you.
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

        <section className="mb-7 w-full">
          <div className="relative mb-3">
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9f8f86] dark:text-[#aaa59d]">
              <SearchIcon />
            </div>

            <input
              type="text"
              value={topic}
              onChange={handleTopicChange}
              placeholder="MERN stack interviews, UPSC, IELTS, German, System Design…"
              autoComplete="off"
              aria-label="What are you preparing for?"
              className={cn(
                'w-full rounded-md border-[1.5px] bg-white py-3.5 pl-10.5 pr-11 text-[14.5px] text-(--text-primary) outline-none transition',
                'placeholder:text-[#9f8f86]',
                'shadow-[0_6px_32px_rgba(26,23,20,0.07),0_1px_6px_rgba(26,23,20,0.04)]',
                'focus:border-(--brand-500) focus:shadow-[0_0_0_4px_rgba(184,76,43,0.12),0_6px_32px_rgba(26,23,20,0.07)]',
                'dark:border-white/15 dark:bg-(--surface-elevated) dark:text-(--text-primary) dark:placeholder:text-[#aaa59d]',
                'dark:focus:border-(--brand-500) dark:focus:shadow-[0_0_0_4px_rgba(232,129,106,0.20),0_18px_60px_rgba(0,0,0,0.45)]',
                topic.trim() && 'border-(--brand-500) dark:border-(--brand-500)',
                topicError &&
                  'border-(--danger) bg-[rgba(217,69,53,0.07)] shadow-[0_0_0_3px_rgba(217,69,53,0.08)] dark:border-(--danger) dark:bg-[rgba(255,107,95,0.10)]'
              )}
            />

            {topic.length > 0 && (
              <button
                type="button"
                onClick={handleClearTopic}
                aria-label="Clear topic"
                className="absolute right-3 top-1/2 flex h-5.5 w-5.5 -translate-y-1/2 items-center justify-center rounded-full bg-[rgba(184,76,43,0.08)] text-(--text-secondary) transition hover:bg-(--brand-500) hover:text-white dark:bg-[rgba(232,129,106,0.09)] dark:text-(--text-secondary) dark:hover:bg-(--brand-500) dark:hover:text-[#141412]"
              >
                <CloseIcon />
              </button>
            )}
          </div>

          {topicError && (
            <div
              className="mb-3 flex items-center gap-1.5 text-[11.5px] text-(--danger) dark:text-(--danger)"
              role="alert"
              aria-live="polite"
            >
              <AlertIcon />
              <span>{topicError}</span>
            </div>
          )}

          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Popular topics"
          >
            {topicChips.map((chip) => {
              const selected = selectedTopicChip === chip

              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleSelectTopicChip(chip)}
                  className={chipClass(selected)}
                >
                  {selected && (
                    <span className="flex h-3.25 w-3.25 shrink-0 items-center justify-center rounded-full bg-(--brand-500) text-white dark:bg-(--brand-500) dark:text-[#141412]">
                      <CheckIcon />
                    </span>
                  )}

                  {chip}
                </button>
              )
            })}
          </div>
        </section>

        <section className="mb-7 w-full">
          <div className="mb-2.5 flex items-center gap-1.75 font-mono text-[9.5px] font-medium uppercase tracking-[0.12em] text-(--brand-500) dark:text-(--brand-500)">
            <FlagIcon />
            Your Ultimate Goal
          </div>

          <textarea
            value={goal}
            onChange={handleGoalChange}
            placeholder="I want to crack product-based interviews and build strong confidence…"
            maxLength={400}
            aria-label="Describe your ultimate goal"
            className={cn(
              'min-h-27.5 w-full resize-y rounded-md border-[1.5px] bg-white p-3.5 text-sm leading-[1.6] text-(--text-primary) outline-none transition',
              'placeholder:text-[#9f8f86]',
              'shadow-[0_6px_32px_rgba(26,23,20,0.07),0_1px_6px_rgba(26,23,20,0.04)]',
              'focus:border-(--brand-500) focus:shadow-[0_0_0_4px_rgba(184,76,43,0.12),0_6px_32px_rgba(26,23,20,0.07)]',
              'dark:border-white/15 dark:bg-(--surface-elevated) dark:text-(--text-primary) dark:placeholder:text-[#aaa59d]',
              'dark:focus:border-(--brand-500) dark:focus:shadow-[0_0_0_4px_rgba(232,129,106,0.20),0_18px_60px_rgba(0,0,0,0.45)]',
              goal.trim() && 'border-(--brand-500) dark:border-(--brand-500)'
            )}
          />

          <div
            className={cn(
              'mt-1 text-right font-mono text-[9.5px] transition',
              charCountClass
            )}
          >
            {goalLength} / 400
          </div>

          <div
            className="mt-3 flex flex-wrap gap-2"
            role="group"
            aria-label="Common goals"
          >
            {goalChips.map((chip) => {
              const selected = selectedGoalChip === chip

              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleSelectGoalChip(chip)}
                  className={chipClass(selected)}
                >
                  {selected && (
                    <span className="flex h-3.25 w-3.25 shrink-0 items-center justify-center rounded-full bg-(--brand-500) text-white dark:bg-(--brand-500) dark:text-[#141412]">
                      <CheckIcon />
                    </span>
                  )}

                  {chip}
                </button>
              )
            })}
          </div>
        </section>

        <section className="w-full rounded-2xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) px-5 py-4.5 shadow-[0_6px_32px_rgba(26,23,20,0.07),0_1px_6px_rgba(26,23,20,0.04)] dark:border-white/15 dark:bg-(--surface-card) dark:shadow-[0_18px_60px_rgba(0,0,0,0.45),0_0_40px_rgba(232,129,106,0.07)]">
          <div className="mb-3.5 flex items-center gap-2">
            <span className="h-1.75 w-1.75 rounded-full bg-(--brand-500) dark:bg-(--brand-500)" />

            <span className="font-mono text-[9px] uppercase tracking-widest text-(--text-secondary) dark:text-(--text-secondary)">
              AI Roadmap Preview
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {previewItems.map(([title, description], index) => (
              <div
                key={`${title}-${index}`}
                className="flex items-center gap-2.5"
              >
                <div className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-md border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] font-mono text-[9px] font-medium text-(--brand-500) dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.09)] dark:text-(--brand-500)">
                  {index + 1}
                </div>

                <p className="text-[12.5px] leading-[1.4] text-(--text-secondary) dark:text-(--text-secondary)">
                  <strong className="font-semibold text-(--text-primary) dark:text-(--text-primary)">
                    {title}
                  </strong>{' '}
                  — {description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between gap-3 border-t border-(--border-subtle) bg-(--surface-canvas)/92 px-4 py-3.5 backdrop-blur-xl dark:border-white/15 dark:bg-(--surface-canvas)/92 sm:px-8 md:px-12">
        <div className="flex min-w-0 flex-1 items-center gap-1.75 text-[11.5px] text-(--text-secondary)/80 dark:text-(--text-secondary)/80">
          <LockIcon />

          <span className="hidden truncate sm:inline">
            Your data is secured with scholarly rigor. Privacy is our priority.
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isPending}
            className="hidden rounded-md border-[1.5px] border-(--border-subtle) px-4 py-2.5 text-[13px] font-medium text-(--text-secondary) transition hover:border-(--brand-500) hover:bg-[rgba(184,76,43,0.08)] hover:text-(--brand-500) disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:text-(--text-secondary) dark:hover:border-[#f5a090] dark:hover:bg-[rgba(232,129,106,0.09)] dark:hover:text-(--brand-500) sm:inline-flex"
          >
            {isPending && pendingAction === 'draft'
              ? 'Saving...'
              : 'Save Draft'}
          </button>

          <button
            type="button"
            onClick={handleContinue}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-md bg-(--brand-500) px-5.5 py-3 text-sm font-bold text-[#f5ede4] transition hover:-translate-y-px hover:bg-(--brand-600) hover:shadow-[0_6px_20px_rgba(184,76,43,0.30)] active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none dark:bg-(--brand-500) dark:text-[#141412] dark:hover:bg-(--brand-600)"
          >
            {isPending && pendingAction === 'continue'
              ? 'Saving...'
              : 'Continue'}

            {!(isPending && pendingAction === 'continue') && (
              <ArrowRightIcon />
            )}
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