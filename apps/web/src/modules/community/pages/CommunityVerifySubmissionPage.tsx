import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import CommunityErrorState from '../components/CommunityErrorState'
import CommunityLayout from '../components/CommunityLayout'
import CommunityPageSkeleton from '../components/CommunityPageSkeleton'
import VerificationVotePanel from '../components/VerificationVotePanel'
import { ArrowLeftIcon, ClockIcon } from '../components/icons/CommunityIcons'
import { useVerificationSubmission } from '../hooks/useVerificationSubmission'
import { useVoteVerificationSubmission } from '../hooks/useVoteVerificationSubmission'
import type { VerificationVoteChoice } from '../types/community.types'
import { getApiErrorMessage } from '../utils/community-formatters'
import { cn, communityPageClass } from '../utils/community-ui'

export default function CommunityVerifySubmissionPage() {
  const navigate = useNavigate()
  const params = useParams<{ submissionId: string }>()
  const submissionId = params.submissionId
  const submissionQuery = useVerificationSubmission(submissionId)
  const voteMutation = useVoteVerificationSubmission()
  const [rewardMessage, setRewardMessage] = useState<string | undefined>()

  const handleVote = (vote: VerificationVoteChoice, reason: string) => {
    if (!submissionId) return

    setRewardMessage(undefined)

    voteMutation.mutate(
      {
        submissionId,
        vote,
        reason: reason || null,
      },
      {
        onSuccess: (result) => {
          if (result.reward.awarded) {
            setRewardMessage(
              `Consensus reached. You earned +${result.reward.coins} coins. Current balance: ${result.reward.balance}.`,
            )
            return
          }

          setRewardMessage('Vote submitted. Rewards unlock after consensus.')
        },
      },
    )
  }

  if (!submissionId) {
    return (
      <CommunityLayout>
        <div className={communityPageClass}>
          <CommunityErrorState
            title="Submission not found"
            message="The verification submission id is missing from the route."
            actionLabel="Back to verify queue"
            onAction={() => navigate('/verify-and-earn')}
          />
        </div>
      </CommunityLayout>
    )
  }

  if (submissionQuery.isLoading && !submissionQuery.data) {
    return <CommunityPageSkeleton variant="detail" />
  }

  return (
    <CommunityLayout>
      <div className={communityPageClass}>
        {submissionQuery.isError || !submissionQuery.data ? (
          <CommunityErrorState
            title="Submission unavailable"
            message={getApiErrorMessage(
              'Something went wrong loading this verification submission.',
              submissionQuery.error?.response?.data?.message,
            )}
            actionLabel="Back to verify queue"
            onAction={() => navigate('/verify-and-earn')}
          />
        ) : (
          <>
            <button
              type="button"
              onClick={() => navigate('/verify-and-earn')}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-[#e0d0c5] bg-[#fdf8f5] px-3 py-1.5 text-[12px] font-bold text-[#6b5f58] transition hover:border-[rgba(184,76,43,0.24)] hover:text-[#b84c2b] dark:border-white/9 dark:bg-[#1e1c19] dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
            >
              <ArrowLeftIcon /> Back to queue
            </button>

            <div className="grid grid-cols-[minmax(0,1fr)_340px] gap-6 max-[980px]:grid-cols-1">
              <section className="min-w-0 rounded-[22px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-6 dark:border-white/9 dark:bg-[#1e1c19]">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-[#e0d0c5] bg-[rgba(26,23,20,0.04)] px-2.5 py-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-widest text-[#9b9a92] dark:border-white/9 dark:bg-white/4">
                    Tracker
                  </span>
                  <span className="inline-flex items-center rounded-full border border-[#e0d0c5] bg-[rgba(26,23,20,0.04)] px-2.5 py-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-widest text-[#9b9a92] dark:border-white/9 dark:bg-white/4">
                    {submissionQuery.data.submission.category}
                  </span>
                  {submissionQuery.data.submission.urgent && (
                    <span className="inline-flex items-center rounded-full border border-[#c49a2c] bg-[rgba(196,154,44,0.08)] px-2.5 py-1 font-['DM_Mono',monospace] text-[8px] font-bold uppercase tracking-widest text-[#7c5a1e] dark:text-[#c49a2c]">
                      Urgent
                    </span>
                  )}
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-widest",
                      submissionQuery.data.submission.closed
                        ? 'border-[#e0d0c5] text-[#9b9a92] dark:border-white/9'
                        : 'border-[rgba(45,106,71,0.22)] bg-[rgba(45,106,71,0.08)] text-[#2d6a47] dark:text-[#5cc98a]',
                    )}
                  >
                    {submissionQuery.data.submission.closed ? 'Closed' : 'Open'}
                  </span>
                </div>

                <h1 className="font-['Playfair_Display',serif] text-[clamp(28px,4vw,44px)] font-extrabold leading-[1.08] tracking-[-1px] text-[#1a1714] dark:text-[#f2f0eb]">
                  {submissionQuery.data.submission.title}
                </h1>

                <p className="mt-4 max-w-3xl text-[14px] italic leading-[1.7] text-[#6b5f58] dark:text-[#9b9a92]">
                  &quot;{submissionQuery.data.submission.excerpt}…&quot;
                </p>

                <div className="mt-6 grid grid-cols-3 divide-x divide-[#e8ddd6] overflow-hidden rounded-[14px] border border-[#e8ddd6] dark:divide-white/8 dark:border-white/8 max-[560px]:grid-cols-1 max-[560px]:divide-x-0 max-[560px]:divide-y">
                  <div className="px-4 py-4">
                    <div className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-widest text-[#9b9a92]">
                      Consensus progress
                    </div>
                    <div className="mt-2 font-['Playfair_Display',serif] text-[26px] font-black text-[#1a1714] dark:text-[#f2f0eb]">
                      {submissionQuery.data.submission.progress}%
                    </div>
                  </div>
                  <div className="px-4 py-4">
                    <div className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-widest text-[#9b9a92]">
                      Time left
                    </div>
                    <div className="mt-2 flex items-center gap-1 font-['Playfair_Display',serif] text-[26px] font-black text-[#1a1714] dark:text-[#f2f0eb]">
                      {!submissionQuery.data.submission.closed && <ClockIcon />}
                      {submissionQuery.data.submission.closed
                        ? 'Closed'
                        : submissionQuery.data.submission.timeLeft || '—'}
                    </div>
                  </div>
                  <div className="px-4 py-4">
                    <div className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-widest text-[#9b9a92]">
                      Your vote
                    </div>
                    <div className="mt-2 font-['Playfair_Display',serif] text-[26px] font-black capitalize text-[#1a1714] dark:text-[#f2f0eb]">
                      {submissionQuery.data.submission.userVote ?? 'None'}
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-[18px] border-[1.5px] border-[rgba(196,154,44,0.18)] bg-[rgba(196,154,44,0.04)] p-5 dark:border-[rgba(196,154,44,0.15)] dark:bg-[rgba(196,154,44,0.04)]">
                  <div className="mb-2 font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.12em] text-[#9b9a92]">
                    Review checklist
                  </div>
                  <ul className="space-y-2 text-[13px] leading-normal text-[#6b5f58] dark:text-[#9b9a92]">
                    <li>• Check if the tracker title, topic, and excerpt are academically accurate.</li>
                    <li>• Vote pass only when the submission is useful enough for learners.</li>
                    <li>• Vote fail when the content is misleading, incomplete, or low-quality.</li>
                  </ul>
                </div>
              </section>

              <aside className="flex flex-col gap-4">
                <VerificationVotePanel
                  submission={submissionQuery.data.submission}
                  pending={voteMutation.isPending}
                  apiError={voteMutation.error?.response?.data?.message}
                  rewardMessage={rewardMessage}
                  onVote={handleVote}
                />
              </aside>
            </div>
          </>
        )}
      </div>
    </CommunityLayout>
  )
}
