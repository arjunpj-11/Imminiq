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

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    style={{
      transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
      transition: 'transform 0.2s ease',
    }}
  >
    <path
      d="M6 9L12 15L18 9"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export default function CommunityVerifySubmissionPage() {
  const navigate = useNavigate()
  const params = useParams<{ submissionId: string }>()
  const submissionId = params.submissionId
  const submissionQuery = useVerificationSubmission(submissionId)
  const voteMutation = useVoteVerificationSubmission()

  const [rewardMessage, setRewardMessage] = useState<string | undefined>()
  const [openTopicId, setOpenTopicId] = useState<string>('')
  const [checkedTopics, setCheckedTopics] = useState<Set<string>>(new Set())

  const submission = submissionQuery.data?.submission
  const reviewTracker = submission?.reviewTracker ?? null

  const topicIds = reviewTracker?.topics.map((t) => t.id) ?? []
  const allTopicsChecked =
    topicIds.length > 0 && topicIds.every((id) => checkedTopics.has(id))

  const toggleTopicChecked = (id: string) => {
    setCheckedTopics((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

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
        {submissionQuery.isError || !submission ? (
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
              className="inline-flex w-fit items-center gap-2 rounded-full border border-(--border-subtle) bg-(--surface-card) px-3 py-1.5 text-[12px] font-bold text-(--text-secondary) transition hover:border-[rgba(184,76,43,0.24)] hover:text-(--brand-500) dark:border-(--border-subtle) dark:bg-(--surface-card) dark:text-(--text-secondary) dark:hover:text-(--brand-500)"
            >
              <ArrowLeftIcon /> Back to queue
            </button>

            <div className="grid grid-cols-[minmax(0,1fr)_340px] gap-6 max-[980px]:grid-cols-1">
              <section className="min-w-0 rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-6 dark:border-(--border-subtle) dark:bg-(--surface-card)">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-(--border-subtle) bg-[rgba(26,23,20,0.04)] px-2.5 py-1 font-mono text-[8px] uppercase tracking-widest text-[#9b9a92] dark:border-(--border-subtle) dark:bg-white/4">
                    Tracker
                  </span>
                  <span className="inline-flex items-center rounded-full border border-(--border-subtle) bg-[rgba(26,23,20,0.04)] px-2.5 py-1 font-mono text-[8px] uppercase tracking-widest text-[#9b9a92] dark:border-(--border-subtle) dark:bg-white/4">
                    {submission.category}
                  </span>
                  {submission.urgent && (
                    <span className="inline-flex items-center rounded-full border border-[#c49a2c] bg-[rgba(196,154,44,0.08)] px-2.5 py-1 font-mono text-[8px] font-bold uppercase tracking-widest text-[#7c5a1e] dark:text-[#c49a2c]">
                      Urgent
                    </span>
                  )}
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[8px] uppercase tracking-widest",
                      submission.closed
                        ? 'border-(--border-subtle) text-[#9b9a92] dark:border-(--border-subtle)'
                        : 'border-[rgba(45,106,71,0.22)] bg-[rgba(45,106,71,0.08)] text-(--success) dark:text-(--success)',
                    )}
                  >
                    {submission.closed ? 'Closed' : 'Open'}
                  </span>
                </div>

                <h1 className="font-ui text-[clamp(28px,4vw,44px)] font-extrabold leading-[1.08] tracking-[-1px] text-(--text-primary) dark:text-(--text-primary)">
                  {submission.title}
                </h1>

                <p className="mt-4 max-w-3xl text-[14px] italic leading-[1.7] text-(--text-secondary) dark:text-(--text-secondary)">
                  &quot;{submission.excerpt}…&quot;
                </p>

                <div className="mt-6 grid grid-cols-3 divide-x divide-[#e8ddd6] overflow-hidden rounded-md border border-[#e8ddd6] dark:divide-white/8 dark:border-white/8 max-[560px]:grid-cols-1 max-[560px]:divide-x-0 max-[560px]:divide-y">
                  <div className="px-4 py-4">
                    <div className="font-mono text-[8px] uppercase tracking-widest text-[#9b9a92]">
                      Consensus progress
                    </div>
                    <div className="mt-2 font-ui text-[26px] font-black text-(--text-primary) dark:text-(--text-primary)">
                      {submission.progress}%
                    </div>
                  </div>
                  <div className="px-4 py-4">
                    <div className="font-mono text-[8px] uppercase tracking-widest text-[#9b9a92]">
                      Time left
                    </div>
                    <div className="mt-2 flex items-center gap-1 font-ui text-[26px] font-black text-(--text-primary) dark:text-(--text-primary)">
                      {!submission.closed && <ClockIcon />}
                      {submission.closed ? 'Closed' : submission.timeLeft || '—'}
                    </div>
                  </div>
                  <div className="px-4 py-4">
                    <div className="font-mono text-[8px] uppercase tracking-widest text-[#9b9a92]">
                      Your vote
                    </div>
                    <div className="mt-2 font-ui text-[26px] font-black capitalize text-(--text-primary) dark:text-(--text-primary)">
                      {submission.userVote ?? 'None'}
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-lg border-[1.5px] border-[rgba(196,154,44,0.18)] bg-[rgba(196,154,44,0.04)] p-5 dark:border-[rgba(196,154,44,0.15)] dark:bg-[rgba(196,154,44,0.04)]">
                  <div className="mb-2 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[#9b9a92]">
                    Review checklist
                  </div>
                  <ul className="space-y-2 text-[13px] leading-normal text-(--text-secondary) dark:text-(--text-secondary)">
                    <li>• Check if the tracker title, topic, and excerpt are academically accurate.</li>
                    <li>• Vote pass only when the submission is useful enough for learners.</li>
                    <li>• Vote fail when the content is misleading, incomplete, or low-quality.</li>
                  </ul>
                </div>

                <div className="mt-6 rounded-xl border-[1.5px] border-(--border-subtle) bg-white/45 p-5 dark:border-(--border-subtle) dark:bg-white/3">
                  <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-widest text-(--brand-500) dark:text-(--brand-500)">
                        Full tracker content
                      </p>
                      <h2 className="mt-1 font-ui text-[24px] font-extrabold text-(--text-primary) dark:text-(--text-primary)">
                        Topics & subtopics for review
                      </h2>
                    </div>

                    {reviewTracker && (
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-(--border-subtle) px-3 py-1 font-mono text-[8px] uppercase tracking-widest text-[#9b9a92] dark:border-(--border-subtle)">
                          {reviewTracker.topicsCount} topics
                        </span>
                        <span className="rounded-full border border-(--border-subtle) px-3 py-1 font-mono text-[8px] uppercase tracking-widest text-[#9b9a92] dark:border-(--border-subtle)">
                          {reviewTracker.subtopicsCount} subtopics
                        </span>
                        <span
                          className={cn(
                            "rounded-full border px-3 py-1 font-mono text-[8px] uppercase tracking-widest transition-colors",
                            allTopicsChecked
                              ? 'border-[rgba(45,106,71,0.35)] bg-[rgba(45,106,71,0.08)] text-(--success) dark:border-[rgba(92,201,138,0.3)] dark:text-(--success)'
                              : 'border-(--border-subtle) text-[#9b9a92] dark:border-(--border-subtle)',
                          )}
                        >
                          {checkedTopics.size}/{topicIds.length} reviewed
                        </span>
                      </div>
                    )}
                  </div>

                  {!reviewTracker || reviewTracker.topics.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-(--border-subtle) px-5 py-8 text-center dark:border-(--border-subtle)">
                      <p className="font-ui text-[20px] font-extrabold text-(--text-primary) dark:text-(--text-primary)">
                        No roadmap content loaded
                      </p>
                      <p className="mt-2 text-[13px] leading-[1.7] text-(--text-secondary) dark:text-(--text-secondary)">
                        Backend should include reviewTracker with topics and subtopics in this submission response.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reviewTracker.topics.map((topic, index) => {
                        const isOpen =
                          openTopicId === '__closed__'
                            ? false
                            : openTopicId === ''
                              ? index === 0
                              : openTopicId === topic.id

                        const isChecked = checkedTopics.has(topic.id)

                        return (
                          <article
                            key={topic.id}
                            className={cn(
                              'overflow-hidden rounded-2xl border transition-colors',
                              isChecked
                                ? 'border-[rgba(45,106,71,0.3)] bg-[rgba(45,106,71,0.04)] dark:border-[rgba(92,201,138,0.2)] dark:bg-[rgba(92,201,138,0.04)]'
                                : 'border-[#e8ddd6] bg-(--surface-card)/70 dark:border-white/8 dark:bg-(--surface-card)/70',
                            )}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setOpenTopicId((current) => {
                                  const currentlyOpen =
                                    current === '__closed__'
                                      ? false
                                      : current === ''
                                        ? index === 0
                                        : current === topic.id
                                  return currentlyOpen ? '__closed__' : topic.id
                                })
                              }
                              className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left transition hover:bg-[rgba(184,76,43,0.04)] dark:hover:bg-[rgba(232,129,106,0.05)]"
                            >
                              <div className="flex min-w-0 gap-3">
                                <span
                                  className={cn(
                                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-mono text-[10px] font-bold transition-colors",
                                    isChecked
                                      ? 'bg-[rgba(45,106,71,0.12)] text-(--success) dark:bg-[rgba(92,201,138,0.12)] dark:text-(--success)'
                                      : 'bg-[rgba(184,76,43,0.09)] text-(--brand-500) dark:bg-[rgba(232,129,106,0.10)] dark:text-(--brand-500)',
                                  )}
                                >
                                  {isChecked ? '✓' : String(index + 1).padStart(2, '0')}
                                </span>
                                <div className="min-w-0">
                                  <h3 className="text-[14px] font-bold text-(--text-primary) dark:text-(--text-primary)">
                                    {topic.title}
                                  </h3>
                                  <p className="mt-1 text-[12px] leading-[1.6] text-(--text-secondary) dark:text-(--text-secondary)">
                                    {topic.description || 'No topic description provided.'}
                                  </p>
                                </div>
                              </div>

                              <div className="flex shrink-0 items-center gap-2">
                                <span className="rounded-full border border-(--border-subtle) px-2.5 py-1 font-mono text-[8px] uppercase tracking-widest text-[#9b9a92] dark:border-(--border-subtle)">
                                  {topic.subtopics.length} subtopics
                                </span>
                                <ChevronIcon open={isOpen} />
                              </div>
                            </button>

                            {/* Mark as reviewed pill */}
                            <div className="border-t border-[#e8ddd6] px-4 py-3 dark:border-white/8">
                              <button
                                type="button"
                                onClick={() => toggleTopicChecked(topic.id)}
                                className={cn(
                                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest transition-all select-none",
                                  isChecked
                                    ? 'border-[rgba(45,106,71,0.35)] bg-[rgba(45,106,71,0.10)] text-(--success) dark:border-[rgba(92,201,138,0.3)] dark:bg-[rgba(92,201,138,0.08)] dark:text-(--success)'
                                    : 'border-(--border-subtle) bg-transparent text-[#9b9a92] hover:border-[rgba(184,76,43,0.3)] hover:text-(--brand-500) dark:border-(--border-subtle) dark:hover:border-[rgba(232,129,106,0.3)] dark:hover:text-(--brand-500)',
                                )}
                              >
                                {isChecked ? (
                                  <>
                                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                                      <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Reviewed
                                  </>
                                ) : (
                                  <>
                                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                                      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                                    </svg>
                                    Mark as reviewed
                                  </>
                                )}
                              </button>
                            </div>

                            {isOpen && (
                              <div className="border-t border-[#e8ddd6] px-4 py-3.5 dark:border-white/8">
                                {topic.subtopics.length > 0 ? (
                                  <div className="space-y-2">
                                    {topic.subtopics.map((subtopic, subIndex) => (
                                      <div
                                        key={subtopic.id}
                                        className="rounded-xl border border-[#e8ddd6] bg-white/55 px-4 py-3 dark:border-white/8 dark:bg-white/3"
                                      >
                                        <div className="flex gap-3">
                                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[rgba(26,23,20,0.05)] font-mono text-[9px] font-bold text-[#9b9a92] dark:bg-white/5">
                                            {subIndex + 1}
                                          </span>
                                          <div>
                                            <h4 className="text-[12.5px] font-bold text-(--text-primary) dark:text-(--text-primary)">
                                              {subtopic.title}
                                            </h4>
                                            <p className="mt-0.5 text-[11px] leading-[1.6] text-(--text-secondary) dark:text-(--text-secondary)">
                                              {subtopic.description || 'No subtopic description provided.'}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="rounded-xl border border-dashed border-(--border-subtle) px-4 py-3 text-[12px] text-[#9b9a92] dark:border-(--border-subtle)">
                                    No subtopics added under this topic.
                                  </p>
                                )}
                              </div>
                            )}
                          </article>
                        )
                      })}
                    </div>
                  )}
                </div>
              </section>

              <aside className="flex flex-col gap-4">
                <VerificationVotePanel
                  submission={submission}
                  pending={voteMutation.isPending}
                  apiError={voteMutation.error?.response?.data?.message}
                  rewardMessage={rewardMessage}
                  allTopicsChecked={allTopicsChecked}
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