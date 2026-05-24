// apps/web/src/modules/onboarding/pages/OnboardingStepOnePage.tsx

import { useMemo, useState } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useSaveOnboardingStepOne } from '../../dashboard/hooks/useSaveOnboardingStepOne'
import { OnboardingLogoIcon as LogoIcon } from '../components/OnboardingLogoIcon'
import { goalChips, roadmapPreviewMap, topicChips } from '../constants/onboarding.constants'
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

  const {
    mutate: saveStepOne,
    isPending,
    error,
    reset,
  } = useSaveOnboardingStepOne()

  const apiError =
    error?.response?.data?.message ||
    (error ? 'Failed to save onboarding details. Please try again.' : '')

  const [topic, setTopic] = useState(() => {
  return (
    sessionStorage.getItem('imminiq_draft_topic') ||
    sessionStorage.getItem('imminiq_topic') ||
    ''
  )
})

const [goal, setGoal] = useState(() => {
  return (
    sessionStorage.getItem('imminiq_draft_goal') ||
    sessionStorage.getItem('imminiq_goal') ||
    ''
  )
})

const [selectedTopicChip, setSelectedTopicChip] = useState<string | null>(() => {
  const savedTopic =
    sessionStorage.getItem('imminiq_draft_topic') ||
    sessionStorage.getItem('imminiq_topic') ||
    ''

  return topicChips.find((chip) => chip === savedTopic) || null
})

const [selectedGoalChip, setSelectedGoalChip] = useState<string | null>(() => {
  const savedGoal =
    sessionStorage.getItem('imminiq_draft_goal') ||
    sessionStorage.getItem('imminiq_goal') ||
    ''

  return goalChips.find((chip) => chip === savedGoal) || null
})
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

    sessionStorage.setItem('imminiq_draft_topic', topic.trim())
    sessionStorage.setItem('imminiq_draft_goal', goal.trim())

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

    sessionStorage.setItem('imminiq_topic', topic.trim())
    sessionStorage.setItem('imminiq_goal', goal.trim())

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
      ? 'text-[#d94535] opacity-100 dark:text-[#ff6b5f]'
      : goalLength > 320
        ? 'text-[#f0a500] opacity-100 dark:text-[#f0a842]'
        : 'text-[#6b5f58]/60 dark:text-[#9b9a92]/60'

  const chipClass = (selected: boolean) =>
    cn(
      'inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-3.5 py-1.75 text-[12.5px] font-medium transition',
      'border-[#e0d0c5] bg-[#fdf8f5] text-[#1a1714]',
      'hover:-translate-y-px hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.07)] hover:text-[#b84c2b]',
      'hover:shadow-[0_3px_12px_rgba(184,76,43,0.09)]',
      'dark:border-white/15 dark:bg-[#1e1c19] dark:text-[#f2f0eb]',
      'dark:hover:border-[#f5a090] dark:hover:bg-[rgba(232,129,106,0.08)] dark:hover:text-[#e8816a]',
      selected &&
        'border-[#b84c2b] bg-[rgba(184,76,43,0.12)] text-[#b84c2b] dark:border-[#e8816a] dark:bg-[rgba(232,129,106,0.15)] dark:text-[#e8816a]'
    )

  return (
    <div className="flex min-h-screen flex-col bg-[#f5ede4] pb-24 font-[DM_Sans,sans-serif] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]">
      <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between border-b border-transparent bg-[#f5ede4]/95 px-5 py-4 backdrop-blur-xl dark:bg-[#141412]/95 sm:px-8 md:px-12">
        <Link to="/" className="inline-flex items-center gap-2.5 leading-none">
          <LogoIcon className="h-8.5 w-8.5 rounded-[9px]" />

          <span className="text-[20px] font-bold leading-none tracking-[-0.5px] text-[#1a1714] dark:text-[#f2f0eb]">
            immin
            <span className="text-[#b84c2b] dark:text-[#e8816a]">iq</span>
            <span className="text-[#b84c2b] dark:text-[#e8816a]">.</span>
          </span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3" aria-label="Step 1 of 2">
            <span className="hidden font-mono text-[9.5px] uppercase tracking-[0.12em] text-[#6b5f58] dark:text-[#9b9a92] sm:inline">
              Step 1 of 2
            </span>

            <div className="flex items-center gap-1.25" aria-hidden="true">
              <span className="h-1.75 w-1.75 rounded-full bg-[#b84c2b] dark:bg-[#e8816a]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#e0d0c5] dark:bg-white/15" />
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
        <div className="h-full w-1/2 rounded-r-sm bg-[#b84c2b] dark:bg-[#e8816a]" />
      </div>

      <main
        className="mx-auto flex w-full max-w-175 flex-1 flex-col items-center px-4 py-8 sm:px-6 sm:py-10 md:py-13"
        onKeyDown={handleMainKeyDown}
      >
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-3 py-1.25 font-mono text-[9.5px] font-medium uppercase tracking-widest text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.09)] dark:text-[#e8816a]">
          <span className="h-1.25 w-1.25 rounded-full bg-[#b84c2b] dark:bg-[#e8816a]" />
          Let&apos;s build your roadmap
        </div>

        <h1 className="mb-2.5 text-center font-serif text-[clamp(26px,6vw,44px)] font-extrabold leading-[1.1] tracking-[-1px] text-[#1a1714] dark:text-[#f2f0eb]">
          What are you preparing for?
        </h1>

        <p className="mb-8 max-w-105 text-center text-sm leading-[1.6] text-[#6b5f58] dark:text-[#9b9a92]">
          Tell us anything — exam, skill, role, or subject. We&apos;ll craft a
          roadmap built for you.
        </p>

        {apiError && (
          <div
            className="mb-5 flex w-full items-start gap-2.5 rounded-xl border border-[rgba(217,69,53,0.2)] border-l-[3px] border-l-[#d94535] bg-[rgba(217,69,53,0.07)] px-3.5 py-3 text-[13px] leading-normal text-[#d94535] dark:border-l-[#ff6b5f] dark:bg-[rgba(255,107,95,0.10)] dark:text-[#ff6b5f]"
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
                'w-full rounded-[14px] border-[1.5px] bg-white py-3.5 pl-10.5 pr-11 text-[14.5px] text-[#1a1714] outline-none transition',
                'placeholder:text-[#9f8f86]',
                'shadow-[0_6px_32px_rgba(26,23,20,0.07),0_1px_6px_rgba(26,23,20,0.04)]',
                'focus:border-[#b84c2b] focus:shadow-[0_0_0_4px_rgba(184,76,43,0.12),0_6px_32px_rgba(26,23,20,0.07)]',
                'dark:border-white/15 dark:bg-[#252320] dark:text-[#f2f0eb] dark:placeholder:text-[#aaa59d]',
                'dark:focus:border-[#e8816a] dark:focus:shadow-[0_0_0_4px_rgba(232,129,106,0.20),0_18px_60px_rgba(0,0,0,0.45)]',
                topic.trim() && 'border-[#b84c2b] dark:border-[#e8816a]',
                topicError &&
                  'border-[#d94535] bg-[rgba(217,69,53,0.07)] shadow-[0_0_0_3px_rgba(217,69,53,0.08)] dark:border-[#ff6b5f] dark:bg-[rgba(255,107,95,0.10)]'
              )}
            />

            {topic.length > 0 && (
              <button
                type="button"
                onClick={handleClearTopic}
                aria-label="Clear topic"
                className="absolute right-3 top-1/2 flex h-5.5 w-5.5 -translate-y-1/2 items-center justify-center rounded-full bg-[rgba(184,76,43,0.08)] text-[#6b5f58] transition hover:bg-[#b84c2b] hover:text-white dark:bg-[rgba(232,129,106,0.09)] dark:text-[#9b9a92] dark:hover:bg-[#e8816a] dark:hover:text-[#141412]"
              >
                <CloseIcon />
              </button>
            )}
          </div>

          {topicError && (
            <div
              className="mb-3 flex items-center gap-1.5 text-[11.5px] text-[#d94535] dark:text-[#ff6b5f]"
              role="alert"
              aria-live="polite"
            >
              <AlertIcon />
              <span>{topicError}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2" role="group" aria-label="Popular topics">
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
                    <span className="flex h-3.25 w-3.25 shrink-0 items-center justify-center rounded-full bg-[#b84c2b] text-white dark:bg-[#e8816a] dark:text-[#141412]">
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
          <div className="mb-2.5 flex items-center gap-1.75 font-mono text-[9.5px] font-medium uppercase tracking-[0.12em] text-[#b84c2b] dark:text-[#e8816a]">
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
              'min-h-27.5 w-full resize-y rounded-[14px] border-[1.5px] bg-white p-3.5 text-sm leading-[1.6] text-[#1a1714] outline-none transition',
              'placeholder:text-[#9f8f86]',
              'shadow-[0_6px_32px_rgba(26,23,20,0.07),0_1px_6px_rgba(26,23,20,0.04)]',
              'focus:border-[#b84c2b] focus:shadow-[0_0_0_4px_rgba(184,76,43,0.12),0_6px_32px_rgba(26,23,20,0.07)]',
              'dark:border-white/15 dark:bg-[#252320] dark:text-[#f2f0eb] dark:placeholder:text-[#aaa59d]',
              'dark:focus:border-[#e8816a] dark:focus:shadow-[0_0_0_4px_rgba(232,129,106,0.20),0_18px_60px_rgba(0,0,0,0.45)]',
              goal.trim() && 'border-[#b84c2b] dark:border-[#e8816a]'
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
                    <span className="flex h-3.25 w-3.25 shrink-0 items-center justify-center rounded-full bg-[#b84c2b] text-white dark:bg-[#e8816a] dark:text-[#141412]">
                      <CheckIcon />
                    </span>
                  )}

                  {chip}
                </button>
              )
            })}
          </div>
        </section>

        <section className="w-full rounded-2xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] px-5 py-4.5 shadow-[0_6px_32px_rgba(26,23,20,0.07),0_1px_6px_rgba(26,23,20,0.04)] dark:border-white/15 dark:bg-[#1e1c19] dark:shadow-[0_18px_60px_rgba(0,0,0,0.45),0_0_40px_rgba(232,129,106,0.07)]">
          <div className="mb-3.5 flex items-center gap-2">
            <span className="h-1.75 w-1.75 rounded-full bg-[#b84c2b] dark:bg-[#e8816a]" />

            <span className="font-mono text-[9px] uppercase tracking-widest text-[#6b5f58] dark:text-[#9b9a92]">
              AI Roadmap Preview
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {previewItems.map(([title, description], index) => (
              <div key={`${title}-${index}`} className="flex items-center gap-2.5">
                <div className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-md border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] font-mono text-[9px] font-medium text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.09)] dark:text-[#e8816a]">
                  {index + 1}
                </div>

                <p className="text-[12.5px] leading-[1.4] text-[#6b5f58] dark:text-[#9b9a92]">
                  <strong className="font-semibold text-[#1a1714] dark:text-[#f2f0eb]">
                    {title}
                  </strong>{' '}
                  — {description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between gap-3 border-t border-[#e0d0c5] bg-[#f5ede4]/92 px-4 py-3.5 backdrop-blur-xl dark:border-white/15 dark:bg-[#141412]/92 sm:px-8 md:px-12">
        <div className="flex min-w-0 flex-1 items-center gap-1.75 text-[11.5px] text-[#6b5f58]/80 dark:text-[#9b9a92]/80">
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
            className="hidden rounded-[10px] border-[1.5px] border-[#e0d0c5] px-4 py-2.5 text-[13px] font-medium text-[#6b5f58] transition hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:text-[#9b9a92] dark:hover:border-[#f5a090] dark:hover:bg-[rgba(232,129,106,0.09)] dark:hover:text-[#e8816a] sm:inline-flex"
          >
            {isPending && pendingAction === 'draft' ? 'Saving...' : 'Save Draft'}
          </button>

          <button
            type="button"
            onClick={handleContinue}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-[11px] bg-[#b84c2b] px-5.5 py-3 text-sm font-bold text-[#f5ede4] transition hover:-translate-y-px hover:bg-[#963d22] hover:shadow-[0_6px_20px_rgba(184,76,43,0.30)] active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]"
          >
            {isPending && pendingAction === 'continue' ? 'Saving...' : 'Continue'}

            {!(isPending && pendingAction === 'continue') && <ArrowRightIcon />}
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