import { useState } from 'react'
import type { FormEvent } from 'react'

import type {
  CommunityVerificationSubmission,
  VerificationVoteChoice,
} from '../types/community.types'
import { validateVoteReason } from '../utils/community-validation'
import { cn } from '../utils/community-ui'
import { CheckIcon, CoinsIcon } from './icons/CommunityIcons'

interface VerificationVotePanelProps {
  submission: CommunityVerificationSubmission
  pending?: boolean
  apiError?: string
  rewardMessage?: string
  allTopicsChecked?: boolean
  onVote: (vote: VerificationVoteChoice, reason: string) => void
}

export default function VerificationVotePanel({
  submission,
  pending = false,
  apiError,
  rewardMessage,
  allTopicsChecked = false,
  onVote,
}: VerificationVotePanelProps) {
  const [vote, setVote] = useState<VerificationVoteChoice>('pass')
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState<string | undefined>()

  const disabled =
    submission.closed ||
    Boolean(submission.userVote) ||
    pending ||
    !allTopicsChecked

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const error = validateVoteReason(reason)
    setReasonError(error)

    if (error) return

    onVote(vote, reason.trim())
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-[20px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 dark:border-white/9 dark:bg-[#1e1c19]"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-['Playfair_Display',serif] text-[18px] font-black text-[#1a1714] dark:text-[#f2f0eb]">
            Cast your review
          </h2>
          <p className="mt-1 text-[12px] leading-normal text-[#6b5f58] dark:text-[#9b9a92]">
            Vote carefully. Rewards are released when your vote matches the majority consensus.
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[rgba(196,154,44,0.24)] bg-[rgba(196,154,44,0.08)] px-3 py-1 font-['DM_Mono',monospace] text-[9px] uppercase tracking-widest text-[#c49a2c]">
          <CoinsIcon /> +50
        </span>
      </div>

      {apiError && (
        <div className="mt-4 rounded-xl border border-[rgba(184,76,43,0.22)] bg-[rgba(184,76,43,0.07)] px-4 py-3 text-[12px] leading-normal text-[#b84c2b] dark:border-[rgba(232,129,106,0.25)] dark:text-[#e8816a]">
          {apiError}
        </div>
      )}

      {rewardMessage && (
        <div className="mt-4 rounded-xl border border-[rgba(45,106,71,0.22)] bg-[rgba(45,106,71,0.07)] px-4 py-3 text-[12px] leading-normal text-[#2d6a47] dark:text-[#5cc98a]">
          {rewardMessage}
        </div>
      )}

      {submission.userVote ? (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-[rgba(45,106,71,0.22)] bg-[rgba(45,106,71,0.07)] px-4 py-3 text-[#2d6a47] dark:text-[#5cc98a]">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#2d6a47] text-white">
            <CheckIcon />
          </span>
          <div>
            <div className="text-[12.5px] font-bold">
              You voted {submission.userVote === 'pass' ? 'Pass' : 'Fail'}
            </div>
            <div className="text-[11px] text-[#6b5f58] dark:text-[#9b9a92]">
              This submission is now waiting for consensus.
            </div>
          </div>
        </div>
      ) : submission.closed ? (
        <div className="mt-5 rounded-xl border border-[#e0d0c5] px-4 py-3 text-[12px] text-[#9b9a92] dark:border-white/9">
          This submission is closed.
        </div>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {(['pass', 'fail'] as const).map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() => setVote(choice)}
                disabled={pending}
                className={cn(
                  'rounded-xl border-[1.5px] px-4 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60',
                  vote === choice
                    ? choice === 'pass'
                      ? 'border-[rgba(45,106,71,0.35)] bg-[rgba(45,106,71,0.08)] text-[#2d6a47] dark:text-[#5cc98a]'
                      : 'border-[rgba(184,76,43,0.35)] bg-[rgba(184,76,43,0.08)] text-[#b84c2b] dark:text-[#e8816a]'
                    : 'border-[#e0d0c5] text-[#6b5f58] hover:border-[rgba(184,76,43,0.24)] dark:border-white/9 dark:text-[#9b9a92]',
                )}
              >
                <div className="font-['Playfair_Display',serif] text-[16px] font-black capitalize">
                  {choice}
                </div>
                <div className="mt-1 text-[11px] leading-normal opacity-80">
                  {choice === 'pass'
                    ? 'The tracker looks accurate and useful.'
                    : 'The tracker needs fixes before approval.'}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4">
            <label
              htmlFor="community-review-reason"
              className="mb-2 block font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.12em] text-[#9b9a92]"
            >
              Reason optional
            </label>
            <textarea
              id="community-review-reason"
              value={reason}
              onChange={(event) => {
                setReason(event.target.value)
                if (reasonError) {
                  setReasonError(validateVoteReason(event.target.value))
                }
              }}
              onBlur={() => setReasonError(validateVoteReason(reason))}
              rows={4}
              placeholder="Add a short reason for your review…"
              className="w-full resize-none rounded-xl border-[1.5px] border-[#e0d0c5] bg-white px-4 py-3 text-[13px] leading-normal text-[#1a1714] outline-none placeholder:text-[#9b9a92] focus:border-[rgba(184,76,43,0.3)] dark:border-white/9 dark:bg-[#141412] dark:text-[#f2f0eb]"
            />
            {reasonError && (
              <p className="mt-2 text-[11px] font-medium text-[#b84c2b] dark:text-[#e8816a]">
                {reasonError}
              </p>
            )}
          </div>

          {!allTopicsChecked && (
            <p className="mt-3 rounded-xl border border-[#e0d0c5] px-4 py-2.5 font-['DM_Mono',monospace] text-[9px] uppercase tracking-widest text-[#9b9a92] dark:border-white/9">
              Review all topics above to unlock voting
            </p>
          )}

          <button
            type="submit"
            disabled={disabled}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border-[1.5px] border-[rgba(184,76,43,0.28)] bg-[rgba(184,76,43,0.08)] px-5 py-3 text-[13px] font-bold text-[#b84c2b] transition hover:-translate-y-px hover:bg-[rgba(184,76,43,0.13)] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[rgba(232,129,106,0.25)] dark:text-[#e8816a]"
          >
            {pending ? 'Submitting review…' : `Submit ${vote} vote`}
          </button>
        </>
      )}
    </form>
  )
}