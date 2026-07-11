import { cn } from '../lib/cn'
import {
  SystemPageFooter,
  SystemPageHeader,
  SystemPageNoise,
  SystemToast,
} from '../components/system/SystemPageChrome'

import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useSubmitModerationAppeal } from '../hooks/moderation/useSubmitModerationAppeal'
import { useGetModerationAppealStatus } from '../hooks/moderation/useGetModerationAppealStatus'
import { useAuthStore } from '../store/useAuthStore'
import {
  getBlockedAppealIdentifier,
  saveBlockedAppealIdentifier,
} from '../lib/blockedAppealSession'

interface IAppealFormState {
  identifier: string
  appealReason: string
  agreed: boolean
}

const formatAppealStatus = (
  status?: 'pending' | 'under_review' | 'approved' | 'rejected'
) => {
  switch (status) {
    case 'pending':
      return 'Pending'
    case 'under_review':
      return 'Under Review'
    case 'approved':
      return 'Approved'
    case 'rejected':
      return 'Rejected'
    default:
      return 'Not Submitted'
  }
}

const ShieldIcon = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      className={className}
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

const FilePlusIcon = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      className={className}
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  )
}

const PhoneIcon = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      className={className}
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .91h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  )
}

const BookIcon = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      className={className}
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
      <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
    </svg>
  )
}

const GlobeIcon = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      className={className}
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  )
}

const CardIcon = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      className={className}
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  )
}

const ChatIcon = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      className={className}
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  )
}

const ArrowRightIcon = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      className={className}
      width="14"
      height="14"
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

const CheckIcon = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      className={className}
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

const SpinnerIcon = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )
}

const LoginIcon = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      className={className}
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M21 19V5a2 2 0 00-2-2h-5" />
    </svg>
  )
}

const AlertIcon = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      className={className}
      width="14"
      height="14"
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

export default function BlockedPage() {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const appealSectionRef = useRef<HTMLDivElement | null>(null)

  const [toast, setToast] = useState('')
  const [isToastVisible, setIsToastVisible] = useState(false)

  const [savedIdentifier, setSavedIdentifier] = useState(
    getBlockedAppealIdentifier
  )

  const [form, setForm] = useState<IAppealFormState>({
    identifier: getBlockedAppealIdentifier(),
    appealReason: '',
    agreed: false,
  })

  const {
    mutate: submitAppeal,
    isPending: isSubmittingAppeal,
    data: submittedAppealResponse,
    error: submitAppealError,
  } = useSubmitModerationAppeal()

  const {
    data: fetchedAppealStatusResponse,
    isLoading: isLoadingAppealStatus,
    error: appealStatusError,
    refetch: refetchAppealStatus,
  } = useGetModerationAppealStatus(savedIdentifier)

  const isRestrictedUser =
    user?.status === 'blocked' ||
    user?.status === 'banned' ||
    user?.status === 'deactivated' ||
    user?.status === 'paused'

  if (isAuthenticated && user && !isRestrictedUser) {
    return <Navigate to="/dashboard" replace />
  }

  const submittedAppeal = submittedAppealResponse?.data

  const fetchedAppeal =
    fetchedAppealStatusResponse?.data?.appeal || null

  const activeAppeal = submittedAppeal || fetchedAppeal

  const hasActiveAppeal = Boolean(activeAppeal)

  const appealStatusExists =
    fetchedAppealStatusResponse?.data?.exists === true

  const displayedAppealReason =
    activeAppeal?.appealReason || form.appealReason

  const apiError = submitAppealError?.response?.data?.message
  const statusError = appealStatusError?.response?.data?.message

  const showToast = (message: string) => {
    setToast(message)
    setIsToastVisible(true)

    window.setTimeout(() => {
      setIsToastVisible(false)
    }, 2600)
  }

  const scrollToAppeal = () => {
    appealSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const persistAppealIdentifier = (identifier: string) => {
    const normalizedIdentifier = identifier.trim()

    saveBlockedAppealIdentifier(normalizedIdentifier)
    setSavedIdentifier(normalizedIdentifier)
  }

  const handleSubmitAppeal = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const identifier = form.identifier.trim()
    const appealReason = form.appealReason.trim()

    if (!identifier) {
      showToast('Please enter your email or phone number.')
      return
    }

    if (appealReason.length < 10) {
      showToast('Appeal reason must be at least 10 characters.')
      return
    }

    if (!form.agreed) {
      showToast('Please confirm the appeal declaration.')
      return
    }

    submitAppeal(
      {
        appealReason,
      },
      {
        onSuccess: (response) => {
          persistAppealIdentifier(identifier)

          const caseId = response.data?.caseId

          showToast(
            caseId
              ? `Appeal submitted successfully. Case ID: ${caseId}`
              : 'Appeal submitted successfully.'
          )
        },

        onError: async (error) => {
          const errorCode = error.response?.data?.code

          if (errorCode === 'ACTIVE_APPEAL_ALREADY_EXISTS') {
            persistAppealIdentifier(identifier)

            await refetchAppealStatus()

            showToast('Your existing appeal has been restored.')
          }
        },
      }
    )
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-(--surface-canvas) font-[DM_Sans,sans-serif] text-(--text-primary) transition-colors dark:bg-(--surface-canvas) dark:text-(--text-primary)">
      <SystemPageNoise />
      <SystemToast message={toast} visible={isToastVisible} />

      <SystemPageHeader
        brandTo="/login"
        actionTo="/login"
        actionLabel="Back to Login"
        actionIcon={<LoginIcon />}
        onUnavailableLink={showToast}
        helpMessage="Help page can be linked here later."
        actionsClassName="gap-1.5"
      />

      {/* Main Page */}
      <div className="relative z-10 flex min-h-[calc(100vh-54px)] flex-col">
        <main className="mx-auto flex w-[min(640px,calc(100%-32px))] flex-1 flex-col py-5 sm:py-8">
          <section className="relative overflow-hidden rounded-3xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) px-5 py-6 shadow-[0_10px_40px_rgba(26,23,20,0.10),0_2px_8px_rgba(26,23,20,0.05)] sm:px-8 sm:py-9 dark:border-(--border-subtle) dark:bg-(--surface-card) dark:shadow-(--shadow-2)">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.55)_0%,transparent_55%)] dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.03)_0%,transparent_55%)]" />

            <div className="relative z-10">
              {/* Shield Hero */}
              <div className="mb-5 flex justify-center">
                <div className="relative flex h-18 w-18 items-center justify-center rounded-full border-2 border-[rgba(184,76,43,0.20)] bg-[rgba(184,76,43,0.09)] text-(--brand-500) shadow-[0_0_0_10px_rgba(184,76,43,0.04)] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-(--brand-500)">
                  <ShieldIcon />
                  <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-[2.5px] border-[#fdf8f5] bg-(--warning) dark:border-[#1e1c19] dark:bg-(--warning)" />
                </div>
              </div>

              <p className="mb-2.5 text-center font-mono text-[8.5px] uppercase tracking-[0.2em] text-(--brand-500) dark:text-(--brand-500)">
                Access Restricted
              </p>

              <h1 className="mb-2.5 text-center font-serif text-[clamp(22px,4vw,30px)] font-extrabold leading-[1.2] tracking-[-0.5px] text-(--text-primary) dark:text-(--text-primary)">
                Your account access is currently restricted
              </h1>

              <p className="mx-auto mb-7 max-w-105 text-center text-[13px] leading-[1.65] text-(--text-secondary) dark:text-(--text-secondary)">
                To ensure the integrity of Imminiq, your account has been
                restricted and may be reviewed by the moderation team.
              </p>

              {/* Status Table */}
              <div className="mb-7 overflow-hidden rounded-md border-[1.5px] border-(--border-subtle) dark:border-(--border-subtle)">
                {[
                  {
                    key: 'Account Status',
                    value: (
                      <span className="rounded-full border border-[rgba(184,76,43,0.20)] bg-[rgba(184,76,43,0.09)] px-2.5 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-(--brand-500) dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-(--brand-500)">
                        Restricted
                      </span>
                    ),
                  },
                  {
                    key: 'Appeal Case ID',
                    value: (
                      <span className="font-mono text-xs tracking-[0.06em]">
                        {activeAppeal?.caseId || 'Not assigned'}
                      </span>
                    ),
                  },
                  {
                    key: 'Appeal Status',
                    value: (
                      <span className="rounded-full border border-[rgba(138,98,0,0.20)] bg-[rgba(138,98,0,0.09)] px-2.5 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-(--warning) dark:border-[rgba(240,168,66,0.24)] dark:bg-[rgba(240,168,66,0.10)] dark:text-(--warning)">
                        {isLoadingAppealStatus
                          ? 'Checking...'
                          : formatAppealStatus(activeAppeal?.status)}
                      </span>
                    ),
                  },
                  {
                    key: 'Appeal Record',
                    value: (
                      <span>
                        {hasActiveAppeal || appealStatusExists
                          ? 'Existing appeal found'
                          : 'No appeal submitted'}
                      </span>
                    ),
                  },
                ].map((item, index, array) => (
                  <div
                    key={item.key}
                    className={cn(
                      'flex items-center justify-between gap-3 px-4.5 py-3.25',
                      index !== array.length - 1 &&
                        'border-b border-(--border-subtle) dark:border-(--border-subtle)',
                      index % 2 === 1 &&
                        'bg-[rgba(26,23,20,0.025)] dark:bg-[rgba(242,240,235,0.025)]'
                    )}
                  >
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-(--text-secondary)/65 dark:text-(--text-secondary)/65">
                      {item.key}
                    </span>

                    <div className="text-right text-[13px] font-semibold text-(--text-primary) dark:text-(--text-primary)">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Common Restriction Reasons */}
              <h2 className="mb-4 font-serif text-lg font-extrabold tracking-[-0.3px] text-(--text-primary) dark:text-(--text-primary)">
                Common reasons for restriction
              </h2>

              <div className="mb-7 flex flex-col gap-1">
                {[
                  {
                    icon: <ShieldIcon className="h-3.75 w-3.75" />,
                    title: 'Academic Integrity Concern',
                    description:
                      'Detected anomalies in challenges, battles, or tracked progress.',
                  },
                  {
                    icon: <GlobeIcon />,
                    title: 'Unusual Login Pattern',
                    description:
                      'Repeated access attempts from suspicious or rapidly changing locations.',
                  },
                  {
                    icon: <CardIcon />,
                    title: 'Billing or Subscription Issue',
                    description:
                      'A payment discrepancy or account ownership verification requirement.',
                  },
                  {
                    icon: <ChatIcon />,
                    title: 'Community Guideline Violation',
                    description:
                      'Reported activity in public trackers, comments, or chat spaces.',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex cursor-default items-start gap-3.5 rounded-xl border-[1.5px] border-transparent px-4 py-3.25 transition hover:border-(--border-subtle) hover:bg-[rgba(26,23,20,0.025)] dark:hover:border-white/10 dark:hover:bg-[rgba(242,240,235,0.025)]"
                  >
                    <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-sm bg-[rgba(26,23,20,0.09)] text-(--text-secondary) dark:bg-[rgba(242,240,235,0.09)] dark:text-(--text-secondary)">
                      {item.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="mb-0.5 text-[13px] font-bold text-(--text-primary) dark:text-(--text-primary)">
                        {item.title}
                      </h3>
                      <p className="text-xs leading-[1.45] text-(--text-secondary) dark:text-(--text-secondary)">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mb-7 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={scrollToAppeal}
                  className="flex flex-col items-center gap-2 rounded-md border-[1.5px] border-(--border-subtle) bg-transparent px-3 py-4 text-xs font-semibold text-(--text-secondary) transition hover:-translate-y-0.5 hover:border-(--brand-500) hover:bg-[rgba(184,76,43,0.08)] hover:text-(--brand-500) hover:shadow-(--shadow-1) dark:border-(--border-subtle) dark:text-(--text-secondary) dark:hover:border-(--brand-500) dark:hover:bg-[rgba(232,129,106,0.10)] dark:hover:text-(--brand-500)"
                >
                  <FilePlusIcon />
                  Submit appeal
                </button>

                <button
                  type="button"
                  onClick={() =>
                    showToast('Support contact flow can be linked later.')
                  }
                  className="flex flex-col items-center gap-2 rounded-md border-[1.5px] border-(--border-subtle) bg-transparent px-3 py-4 text-xs font-semibold text-(--text-secondary) transition hover:-translate-y-0.5 hover:border-(--brand-500) hover:bg-[rgba(184,76,43,0.08)] hover:text-(--brand-500) hover:shadow-(--shadow-1) dark:border-(--border-subtle) dark:text-(--text-secondary) dark:hover:border-(--brand-500) dark:hover:bg-[rgba(232,129,106,0.10)] dark:hover:text-(--brand-500)"
                >
                  <PhoneIcon />
                  Contact support
                </button>

                <button
                  type="button"
                  onClick={() =>
                    showToast('Guidelines page can be linked later.')
                  }
                  className="flex flex-col items-center gap-2 rounded-md border-[1.5px] border-(--border-subtle) bg-transparent px-3 py-4 text-xs font-semibold text-(--text-secondary) transition hover:-translate-y-0.5 hover:border-(--brand-500) hover:bg-[rgba(184,76,43,0.08)] hover:text-(--brand-500) hover:shadow-(--shadow-1) dark:border-(--border-subtle) dark:text-(--text-secondary) dark:hover:border-(--brand-500) dark:hover:bg-[rgba(232,129,106,0.10)] dark:hover:text-(--brand-500)"
                >
                  <BookIcon />
                  Read guidelines
                </button>
              </div>

              <div className="mb-7 h-px bg-(--border-subtle) dark:bg-white/10" />

              {/* Appeal Form */}
              <div ref={appealSectionRef}>
                <h2 className="mb-4 font-serif text-lg font-extrabold tracking-[-0.3px] text-(--text-primary) dark:text-(--text-primary)">
                  Submit an appeal
                </h2>

                <p className="mb-5 text-[13px] leading-[1.55] text-(--text-secondary) dark:text-(--text-secondary)">
                  Enter the email or phone number linked to your restricted
                  account and explain why the moderation team should review it.
                </p>

                {apiError && (
                  <div
                    className="mb-4 flex items-start gap-2.5 rounded-md border border-[rgba(217,69,53,0.2)] border-l-[3px] border-l-(--danger) bg-[rgba(217,69,53,0.07)] px-3.5 py-3 text-[13px] leading-normal text-(--danger) dark:border-l-(--danger) dark:bg-[rgba(255,107,95,0.10)] dark:text-(--danger)"
                    role="alert"
                  >
                    <AlertIcon className="mt-0.5 shrink-0" />
                    <span>{apiError}</span>
                  </div>
                )}

                {statusError && savedIdentifier && !activeAppeal && (
                  <div
                    className="mb-4 flex items-start gap-2.5 rounded-md border border-[rgba(217,69,53,0.2)] border-l-[3px] border-l-(--danger) bg-[rgba(217,69,53,0.07)] px-3.5 py-3 text-[13px] leading-normal text-(--danger) dark:border-l-(--danger) dark:bg-[rgba(255,107,95,0.10)] dark:text-(--danger)"
                    role="alert"
                  >
                    <AlertIcon className="mt-0.5 shrink-0" />
                    <span>{statusError}</span>
                  </div>
                )}

                {activeAppeal && (
                  <div
                    className="mb-4 flex items-start gap-2.5 rounded-md border border-[rgba(45,106,71,0.20)] border-l-[3px] border-l-(--success) bg-[rgba(45,106,71,0.08)] px-3.5 py-3 text-[13px] leading-normal text-(--success) dark:border-l-(--success) dark:bg-[rgba(92,201,138,0.10)] dark:text-(--success)"
                    role="status"
                  >
                    <CheckIcon className="mt-0.5 shrink-0" />
                    <span>
                      Appeal already submitted. Case ID:{' '}
                      <strong>{activeAppeal.caseId}</strong>. Current status:{' '}
                      <strong>{formatAppealStatus(activeAppeal.status)}</strong>.
                    </span>
                  </div>
                )}

                <form onSubmit={handleSubmitAppeal}>
                  <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="blocked-identifier"
                        className="font-mono text-[8.5px] uppercase tracking-[0.15em] text-(--text-secondary)/70 dark:text-(--text-secondary)/70"
                      >
                        Email or Phone Number
                      </label>

                      <input
                        id="blocked-identifier"
                        type="text"
                        value={form.identifier}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            identifier: event.target.value,
                          }))
                        }
                        placeholder="you@example.com or +91 98765 43210"
                        disabled={isSubmittingAppeal || hasActiveAppeal}
                        className="w-full rounded-md border-[1.5px] border-(--border-subtle) bg-white px-3.5 py-2.5 text-[13px] text-(--text-primary) outline-none transition placeholder:text-(--text-secondary)/50 focus:border-(--brand-500) focus:shadow-[0_0_0_3px_rgba(184,76,43,0.12)] disabled:cursor-not-allowed disabled:opacity-70 dark:border-(--border-subtle) dark:bg-(--surface-elevated) dark:text-(--text-primary) dark:placeholder:text-[#9b9a92]/55 dark:focus:border-(--brand-500) dark:focus:shadow-[0_0_0_3px_rgba(232,129,106,0.18)]"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="blocked-case-id"
                        className="font-mono text-[8.5px] uppercase tracking-[0.15em] text-(--text-secondary)/70 dark:text-(--text-secondary)/70"
                      >
                        Appeal Case ID
                      </label>

                      <input
                        id="blocked-case-id"
                        type="text"
                        value={activeAppeal?.caseId || 'Assigned after submission'}
                        readOnly
                        className="w-full rounded-md border-[1.5px] border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-3.5 py-2.5 font-mono text-xs tracking-[0.06em] text-(--brand-500) outline-none dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-(--brand-500)"
                      />
                    </div>
                  </div>

                  <div className="mb-3.5 flex flex-col gap-1.5">
                    <label
                      htmlFor="blocked-appeal-reason"
                      className="font-mono text-[8.5px] uppercase tracking-[0.15em] text-(--text-secondary)/70 dark:text-(--text-secondary)/70"
                    >
                      Appeal Reason
                    </label>

                    <textarea
                      id="blocked-appeal-reason"
                      value={displayedAppealReason}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          appealReason: event.target.value,
                        }))
                      }
                      placeholder="Explain the situation clearly so the moderation team can review your request."
                      disabled={isSubmittingAppeal || hasActiveAppeal}
                      className="min-h-25 w-full resize-none rounded-md border-[1.5px] border-(--border-subtle) bg-white px-3.5 py-2.5 text-[13px] leading-[1.55] text-(--text-primary) outline-none transition placeholder:text-(--text-secondary)/50 focus:border-(--brand-500) focus:shadow-[0_0_0_3px_rgba(184,76,43,0.12)] disabled:cursor-not-allowed disabled:opacity-70 dark:border-(--border-subtle) dark:bg-(--surface-elevated) dark:text-(--text-primary) dark:placeholder:text-[#9b9a92]/55 dark:focus:border-(--brand-500) dark:focus:shadow-[0_0_0_3px_rgba(232,129,106,0.18)]"
                    />
                  </div>

                  <label className="mb-4 flex cursor-pointer items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={form.agreed}
                      disabled={isSubmittingAppeal || hasActiveAppeal}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          agreed: event.target.checked,
                        }))
                      }
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-(--brand-500) disabled:cursor-not-allowed dark:accent-(--brand-500)"
                    />

                    <span className="text-xs leading-[1.55] text-(--text-secondary) dark:text-(--text-secondary)">
                      I confirm that the appeal details I provided are accurate.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmittingAppeal || hasActiveAppeal}
                    className={cn(
                      'flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.25 text-sm font-bold text-[#fdf8f5] transition',
                      hasActiveAppeal
                        ? 'cursor-default bg-(--success) dark:bg-(--success) dark:text-[#141412]'
                        : 'bg-(--brand-500) hover:-translate-y-px hover:bg-(--brand-600) hover:shadow-[0_8px_28px_rgba(184,76,43,0.28)] dark:bg-(--brand-500) dark:text-[#141412] dark:hover:bg-(--brand-600)',
                      isSubmittingAppeal && 'cursor-wait opacity-90'
                    )}
                  >
                    {isSubmittingAppeal ? (
                      <>
                        <SpinnerIcon className="animate-spin" />
                        Submitting…
                      </>
                    ) : hasActiveAppeal ? (
                      <>
                        <CheckIcon />
                        Appeal already submitted
                      </>
                    ) : (
                      <>
                        Submit appeal
                        <ArrowRightIcon />
                      </>
                    )}
                  </button>
                </form>

                {/* Safe Box */}
                <div className="mt-5 rounded-md border-[1.5px] border-[rgba(45,106,71,0.20)] bg-[rgba(45,106,71,0.08)] px-5 py-4.5 dark:border-[rgba(92,201,138,0.22)] dark:bg-[rgba(92,201,138,0.10)]">
                  <div className="mb-2 flex items-center gap-2 text-sm font-bold text-(--success) dark:text-(--success)">
                    <ShieldIcon className="h-3.75 w-3.75" />
                    Your data is safe
                  </div>

                  <p className="mb-3 text-[12.5px] leading-[1.55] text-(--text-secondary) dark:text-(--text-secondary)">
                    Restrictions do not delete your stored learning data or your
                    account history.
                  </p>

                  <div className="flex flex-col gap-1.5">
                    {[
                      'Your saved trackers and records remain stored.',
                      'The moderation team can review your submitted appeal.',
                      'Only one active appeal can exist at a time.',
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2.25 text-[12.5px] text-(--text-secondary) dark:text-(--text-secondary)"
                      >
                        <CheckIcon className="shrink-0 text-(--success) dark:text-(--success)" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Bar */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-2.5 border-t border-(--border-subtle) pt-4 dark:border-(--border-subtle)">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.25 rounded-full border border-[rgba(45,106,71,0.20)] bg-[rgba(45,106,71,0.08)] px-2.75 py-1 font-mono text-[8.5px] uppercase tracking-widest text-(--success) dark:border-[rgba(92,201,138,0.22)] dark:bg-[rgba(92,201,138,0.10)] dark:text-(--success)">
                    <CheckIcon className="h-2.25 w-2.25" />
                    {hasActiveAppeal ? 'Appeal logged' : 'Appeal available'}
                  </span>

                  <span className="inline-flex items-center gap-1.25 rounded-full border border-[rgba(138,98,0,0.20)] bg-[rgba(138,98,0,0.09)] px-2.75 py-1 font-mono text-[8.5px] uppercase tracking-widest text-(--warning) dark:border-[rgba(240,168,66,0.24)] dark:bg-[rgba(240,168,66,0.10)] dark:text-(--warning)">
                    <FilePlusIcon className="h-2.25 w-2.25" />
                    {formatAppealStatus(activeAppeal?.status)}
                  </span>
                </div>

                <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-(--text-secondary)/40 dark:text-(--text-secondary)/40">
                  Imminiq Moderation Review
                </span>
              </div>
            </div>
          </section>
        </main>

        <SystemPageFooter onUnavailableLink={showToast} />
      </div>
    </div>
  )
}
