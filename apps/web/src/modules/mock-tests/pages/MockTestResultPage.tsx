import { cn } from '../../../lib/cn'

// MockTestResultPage.tsx

import { useNavigate, useParams } from 'react-router-dom'

import { AppShellBoundary } from '../../../components/layout/AppShell'

import { useMockTestAttemptResult } from '../hooks/useMockTests'
import { formatDuration } from '../utils/mock-tests-formatters'

export default function MockTestResultPage() {
  const { attemptId = '' } = useParams()
  const navigate = useNavigate()

  const resultQuery = useMockTestAttemptResult(attemptId)
  const data = resultQuery.data
  const report = data?.report

  const resultAccent = report?.passed ? 'var(--success)' : 'var(--brand-500)'

  return (
    <AppShellBoundary>
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 max-[640px]:px-4">
        <div className="w-full max-w-215">
          {resultQuery.isLoading && (
            <div className="h-72 animate-pulse rounded-2xl border border-(--border-subtle) bg-(--surface-card) shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)" />
          )}

          {resultQuery.isError && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-600 dark:text-red-300">
              Failed to load result.
            </div>
          )}

          {!resultQuery.isLoading && !resultQuery.isError && !data && (
            <div className="rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-6 text-(--text-secondary) shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card) dark:text-(--text-secondary)">
              Result not found.
            </div>
          )}

          {report && (
            <section
              className="rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-10 text-center shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)"
              style={{ borderTop: `2.5px solid ${resultAccent}` }}
            >
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-3 py-1.5 dark:border-(--border-subtle) dark:bg-white/5">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background: report.passed ? 'var(--success)' : 'var(--brand-500)',
                  }}
                />

                <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-(--text-secondary) dark:text-(--text-secondary)">
                  Result
                </span>
              </div>

              <div className="mt-5 font-ui text-[72px] font-black leading-none text-(--text-primary) dark:text-(--text-primary)">
                {report.scorePercentage}%
              </div>

              <div
                className={cn(
                  'mx-auto mt-4 w-fit rounded-full px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest',
                  report.passed
                    ? 'border border-[rgba(45,106,71,0.22)] bg-[rgba(45,106,71,0.10)] text-(--success) dark:border-(--success)/30 dark:bg-(--success)/10 dark:text-(--success)'
                    : 'border border-[rgba(184,76,43,0.24)] bg-[rgba(184,76,43,0.08)] text-(--brand-500) dark:border-(--brand-500)/30 dark:bg-(--brand-500)/10 dark:text-(--brand-500)'
                )}
              >
                {report.passed ? 'Passed' : 'Needs practice'}
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-4">
                {[
                  { label: 'Score', value: report.score },
                  { label: 'Correct', value: report.correctAnswers },
                  { label: 'Skipped', value: report.skippedAnswers },
                  {
                    label: 'Time',
                    value: formatDuration(report.timeTakenSeconds),
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-(--border-subtle) bg-(--surface-canvas) p-4 dark:border-white/8 dark:bg-(--surface-canvas)"
                  >
                    <div className="font-mono text-[9px] uppercase tracking-[0.13em] text-(--text-secondary) dark:text-(--text-secondary)">
                      {label}
                    </div>

                    <div className="mt-2 font-ui text-[24px] font-black text-(--text-primary) dark:text-(--text-primary)">
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(`/mock-tests/attempts/${attemptId}/analysis`)
                }
                className="mt-7 rounded-md bg-(--brand-500) px-6 py-3 font-ui text-[15px] font-bold text-white shadow-[0_2px_12px_rgba(184,76,43,0.22)] transition hover:-translate-y-px hover:bg-(--brand-600) dark:bg-(--brand-500) dark:shadow-none dark:hover:bg-[#d9522d]"
              >
                View analysis
              </button>
            </section>
          )}
        </div>
      </div>
    </AppShellBoundary>
  )
}
