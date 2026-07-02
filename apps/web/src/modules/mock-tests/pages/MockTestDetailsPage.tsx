// ============================================================
// MockTestDetailsPage.tsx — aligned with Trackers design
// ============================================================

import type { ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { AppShellBoundary } from '../../../components/layout/AppShell'

import {
  useMockTestDetails,
  useStartMockTestAttempt,
} from '../hooks/useMockTests'

function PageShell({ children }: { children: ReactNode }) {
  return (
    <AppShellBoundary>
      <div className="mx-auto mt-5.5 flex w-[min(860px,calc(100%-48px))] max-w-full min-w-0 flex-col gap-6 pb-[calc(80px+env(safe-area-inset-bottom,0)+16px)] max-[900px]:mt-4.5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[640px]:mt-3 max-[640px]:w-[calc(100%-20px)]">
        {children}
      </div>
    </AppShellBoundary>
  )
}


export default function MockTestDetailsPage() {
  const { testId = '' } = useParams()
  const navigate = useNavigate()

  const detailsQuery = useMockTestDetails(testId)
  const startMutation = useStartMockTestAttempt()
  const data = detailsQuery.data

  const start = async () => {
    if (!testId) return

    const response = await startMutation.mutateAsync(testId)
    const started = response.data

    navigate(`/mock-tests/attempts/${started.attempt._id}`, {
      state: started,
    })
  }

  if (detailsQuery.isLoading) {
    return (
      <PageShell>
        <div className="h-72 animate-pulse rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/10 dark:bg-[#1c1a18]" />

        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/10 dark:bg-[#1c1a18]"
            />
          ))}
        </div>
      </PageShell>
    )
  }

  if (detailsQuery.isError) {
    return (
      <PageShell>
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-600 dark:text-red-300">
          Failed to load mock test.
        </div>
      </PageShell>
    )
  }

  if (!data) {
    return (
      <PageShell>
        <div className="rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] p-6 text-[#6b5f58] shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/10 dark:bg-[#1c1a18] dark:text-[#9b9a92]">
          Test not found.
        </div>
      </PageShell>
    )
  }

  const isContinuing = data.latestAttempt?.status === 'in_progress'

  return (
    <PageShell>
      {/* ── hero card ── */}
      <section
        className="rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] p-7 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/10 dark:bg-[#1c1a18]"
        style={{ borderTop: '2.5px solid #b84c2b' }}
      >
        <div className="font-['DM_Mono',monospace] text-[10px] uppercase tracking-[0.16em] text-[#6b5f58] dark:text-[#9b9a92]">
          {data.test.difficulty} · {data.test.questionCount} questions ·{' '}
          {data.test.timeLimitMinutes} min
        </div>

        <h1 className="mt-3 font-['Playfair_Display',serif] text-[38px] font-black leading-tight text-[#1a1714] dark:text-[#f2f0eb]">
          {data.test.title}
        </h1>

        {data.test.description && (
          <p className="mt-3 text-[14px] leading-7 text-[#6b5f58] dark:text-[#6b6560]">
            {data.test.description}
          </p>
        )}

        {/* tags */}
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full border border-[#e0d0c5] bg-[#f5ede4] px-3 py-1 font-['DM_Mono',monospace] text-[10px] uppercase tracking-widest text-[#6b5f58] dark:border-white/10 dark:bg-white/5 dark:text-[#9b9a92]">
            {data.test.visibility}
          </span>

          <span className="rounded-full border border-[#e0d0c5] bg-[#f5ede4] px-3 py-1 font-['DM_Mono',monospace] text-[10px] uppercase tracking-widest text-[#6b5f58] dark:border-white/10 dark:bg-white/5 dark:text-[#9b9a92]">
            {data.test.isAIGenerated ? 'AI generated' : 'Manual'}
          </span>

          {data.test.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[#e0d0c5] bg-[#f5ede4] px-3 py-1 font-['DM_Mono',monospace] text-[10px] uppercase tracking-widest text-[#6b5f58] dark:border-white/10 dark:bg-white/5 dark:text-[#9b9a92]"
            >
              {tag}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={start}
          disabled={startMutation.isPending}
          className="mt-6 rounded-[14px] bg-[#b84c2b] px-5 py-3 font-['Playfair_Display',serif] text-[15px] font-bold text-white shadow-[0_2px_12px_rgba(184,76,43,0.22)] transition hover:-translate-y-px hover:bg-[#963d22] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#e8816a] dark:shadow-none dark:hover:bg-[#d9522d]"
        >
          {startMutation.isPending
            ? 'Preparing...'
            : isContinuing
              ? 'Continue attempt'
              : 'Start test'}
        </button>
      </section>

      {/* ── question preview list ── */}
      <section className="space-y-3">
        {data.questions.map((question, index) => (
          <article
            key={question._id}
            className="rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] p-4 shadow-[0_2px_16px_rgba(26,23,20,0.06)] transition hover:-translate-y-0.5 hover:border-[rgba(184,76,43,0.22)] hover:shadow-[0_10px_40px_rgba(26,23,20,0.10)] dark:border-white/10 dark:bg-[#1c1a18] dark:hover:border-white/20"
          >
            <div className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.13em] text-[#6b5f58] dark:text-[#9b9a92]">
              Question {index + 1} · {question.type.replace('_', ' ')} ·{' '}
              {question.points} pts
            </div>

            <h3 className="mt-2 font-['Playfair_Display',serif] text-[16px] font-black leading-snug text-[#1a1714] dark:text-[#f2f0eb]">
              {question.question}
            </h3>

            {question.options?.length ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {question.options.map((option) => (
                  <div
                    key={option}
                    className="rounded-[10px] border border-[#e0d0c5] bg-[#f5ede4] px-3 py-2 text-[13px] text-[#6b5f58] dark:border-white/8 dark:bg-[#141412] dark:text-[#9b9a92]"
                  >
                    {option}
                  </div>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </section>
    </PageShell>
  )
}
