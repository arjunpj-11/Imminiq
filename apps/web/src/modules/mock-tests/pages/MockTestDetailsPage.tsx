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
        <div className="h-72 animate-pulse rounded-2xl border border-(--border-subtle) bg-(--surface-card) shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)" />

        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-2xl border border-(--border-subtle) bg-(--surface-card) shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)"
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
        <div className="rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-6 text-(--text-secondary) shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card) dark:text-(--text-secondary)">
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
        className="rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-7 shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)"
        style={{ borderTop: '2.5px solid var(--brand-500)' }}
      >
        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-(--text-secondary) dark:text-(--text-secondary)">
          {data.test.difficulty} · {data.test.questionCount} questions ·{' '}
          {data.test.timeLimitMinutes} min
        </div>

        <h1 className="mt-3 font-ui text-[38px] font-black leading-tight text-(--text-primary) dark:text-(--text-primary)">
          {data.test.title}
        </h1>

        {data.test.description && (
          <p className="mt-3 text-[14px] leading-7 text-(--text-secondary) dark:text-[#6b6560]">
            {data.test.description}
          </p>
        )}

        {/* tags */}
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full border border-(--border-subtle) bg-(--surface-canvas) px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-(--text-secondary) dark:border-(--border-subtle) dark:bg-white/5 dark:text-(--text-secondary)">
            {data.test.visibility}
          </span>

          <span className="rounded-full border border-(--border-subtle) bg-(--surface-canvas) px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-(--text-secondary) dark:border-(--border-subtle) dark:bg-white/5 dark:text-(--text-secondary)">
            {data.test.isAIGenerated ? 'AI generated' : 'Manual'}
          </span>

          {data.test.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-(--border-subtle) bg-(--surface-canvas) px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-(--text-secondary) dark:border-(--border-subtle) dark:bg-white/5 dark:text-(--text-secondary)"
            >
              {tag}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={start}
          disabled={startMutation.isPending}
          className="mt-6 rounded-md bg-(--brand-500) px-5 py-3 font-ui text-[15px] font-bold text-white shadow-[0_2px_12px_rgba(184,76,43,0.22)] transition hover:-translate-y-px hover:bg-(--brand-600) disabled:cursor-not-allowed disabled:opacity-60 dark:bg-(--brand-500) dark:shadow-none dark:hover:bg-[#d9522d]"
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
            className="rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-4 shadow-(--shadow-1) transition hover:-translate-y-0.5 hover:border-[rgba(184,76,43,0.22)] hover:shadow-(--shadow-2) dark:border-(--border-subtle) dark:bg-(--surface-card) dark:hover:border-white/20"
          >
            <div className="font-mono text-[9px] uppercase tracking-[0.13em] text-(--text-secondary) dark:text-(--text-secondary)">
              Question {index + 1} · {question.type.replace('_', ' ')} ·{' '}
              {question.points} pts
            </div>

            <h3 className="mt-2 font-ui text-[16px] font-black leading-snug text-(--text-primary) dark:text-(--text-primary)">
              {question.question}
            </h3>

            {question.options?.length ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {question.options.map((option) => (
                  <div
                    key={option}
                    className="rounded-md border border-(--border-subtle) bg-(--surface-canvas) px-3 py-2 text-[13px] text-(--text-secondary) dark:border-white/8 dark:bg-(--surface-canvas) dark:text-(--text-secondary)"
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
