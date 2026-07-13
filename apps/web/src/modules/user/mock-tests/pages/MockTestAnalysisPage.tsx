import { cn } from '../../../../lib/cn'

// ============================================================
// MockTestAnalysisPage.tsx — aligned with Trackers design
// ============================================================

import { useParams } from 'react-router-dom'

import { AppShellBoundary } from '../../../../components/layout/AppShell'

import { useMockTestAttemptAnalysis } from '../hooks/useMockTests'

export default function MockTestAnalysisPage() {
  const { attemptId = '' } = useParams()

  const query = useMockTestAttemptAnalysis(attemptId)
  const data = query.data

  const summaryAccent = data?.passed ? 'var(--success)' : 'var(--brand-500)'

  return (
    <AppShellBoundary>
      <div className="mx-auto mt-5.5 flex w-[min(860px,calc(100%-48px))] max-w-full min-w-0 flex-col gap-6 pb-[calc(80px+env(safe-area-inset-bottom,0)+16px)] max-[900px]:mt-4.5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[640px]:mt-3 max-[640px]:w-[calc(100%-20px)]">
        {/* ── page header ── */}
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-3 py-1.5 dark:border-(--border-subtle) dark:bg-white/5">
            <span className="h-1.5 w-1.5 rounded-full bg-(--brand-500) dark:bg-(--brand-500)" />

            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-(--brand-500) dark:text-(--text-secondary)">
              Mock test
            </span>
          </div>

          <h1 className="mt-3 font-ui text-[38px] font-black leading-tight text-(--text-primary) dark:text-(--text-primary)">
            Attempt{' '}
            <span className="text-(--brand-500) dark:text-(--brand-500)">
              analysis
            </span>
          </h1>
        </div>

        {/* ── loading ── */}
        {query.isLoading ? (
          <div className="space-y-4">
            <div className="h-52 animate-pulse rounded-2xl border border-(--border-subtle) bg-(--surface-card) shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)" />
            <div className="h-36 animate-pulse rounded-2xl border border-(--border-subtle) bg-(--surface-card) shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)" />
            <div className="h-36 animate-pulse rounded-2xl border border-(--border-subtle) bg-(--surface-card) shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)" />
          </div>
        ) : query.isError ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-600 dark:text-red-300">
            Failed to load attempt analysis.
          </div>
        ) : data ? (
          <>
            {/* ── summary card ── */}
            <section
              className="rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-6 shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)"
              style={{
                borderTop: `2.5px solid ${summaryAccent}`,
              }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.13em] text-(--text-secondary) dark:text-(--text-secondary)">
                    Final score
                  </div>

                  <div className="mt-2 font-ui text-[54px] font-black leading-none text-(--text-primary) dark:text-(--text-primary)">
                    {data.scorePercentage}%
                  </div>
                </div>

                <div
                  className={cn(
                    'w-fit rounded-full px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest',
                    data.passed
                      ? 'border border-[rgba(45,106,71,0.22)] bg-[rgba(45,106,71,0.10)] text-(--success) dark:border-(--success)/30 dark:bg-(--success)/10 dark:text-(--success)'
                      : 'border border-[rgba(184,76,43,0.24)] bg-[rgba(184,76,43,0.08)] text-(--brand-500) dark:border-(--brand-500)/30 dark:bg-(--brand-500)/10 dark:text-(--brand-500)'
                  )}
                >
                  {data.passed ? 'Passed' : 'Needs practice'}
                </div>
              </div>

              {data.recommendations.length > 0 && (
                <div className="mt-5 border-t border-(--border-subtle) pt-5 dark:border-white/8">
                  <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.13em] text-(--text-secondary) dark:text-(--text-secondary)">
                    Recommendations
                  </div>

                  <ul className="space-y-2">
                    {data.recommendations.map((rec) => (
                      <li
                        key={rec}
                        className="flex items-start gap-2 text-[13px] leading-6 text-(--text-secondary) dark:text-(--text-secondary)"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-(--brand-500) dark:bg-(--brand-500)" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-(--border-subtle) bg-(--surface-canvas) p-4 dark:border-white/8 dark:bg-(--surface-canvas)">
                  <div className="font-mono text-[9px] uppercase tracking-[0.13em] text-(--text-secondary) dark:text-(--text-secondary)">
                    Strong areas
                  </div>

                  <p className="mt-2 text-[13px] font-bold text-(--success) dark:text-(--success)">
                    {data.strongTopics.length
                      ? data.strongTopics.join(', ')
                      : 'Not enough data'}
                  </p>
                </div>

                <div className="rounded-xl border border-(--border-subtle) bg-(--surface-canvas) p-4 dark:border-white/8 dark:bg-(--surface-canvas)">
                  <div className="font-mono text-[9px] uppercase tracking-[0.13em] text-(--text-secondary) dark:text-(--text-secondary)">
                    Weak areas
                  </div>

                  <p className="mt-2 text-[13px] font-bold text-(--brand-500) dark:text-(--brand-500)">
                    {data.weakTopics.length
                      ? data.weakTopics.join(', ')
                      : 'No weak area found'}
                  </p>
                </div>
              </div>
            </section>

            {/* ── question breakdown ── */}
            <section className="space-y-3">
              {data.questionBreakdown.map((item, index) => (
                <article
                  key={item.questionId}
                  className="rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-5 shadow-(--shadow-1) transition hover:-translate-y-0.5 hover:border-[rgba(184,76,43,0.22)] hover:shadow-(--shadow-2) dark:border-(--border-subtle) dark:bg-(--surface-card) dark:hover:border-white/20"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="font-mono text-[9px] uppercase tracking-[0.13em] text-(--text-secondary) dark:text-(--text-secondary)">
                        Question {index + 1}
                      </div>

                      <h3 className="mt-2 font-ui text-[16px] font-black leading-snug text-(--text-primary) dark:text-(--text-primary)">
                        {item.question}
                      </h3>
                    </div>

                    <div
                      className={cn(
                        'shrink-0 rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest',
                        item.isCorrect
                          ? 'border border-[rgba(45,106,71,0.22)] bg-[rgba(45,106,71,0.10)] text-(--success) dark:border-(--success)/30 dark:bg-(--success)/10 dark:text-(--success)'
                          : 'border border-[rgba(184,76,43,0.24)] bg-[rgba(184,76,43,0.08)] text-(--brand-500) dark:border-(--brand-500)/30 dark:bg-(--brand-500)/10 dark:text-(--brand-500)'
                      )}
                    >
                      {item.pointsEarned}/{item.maxPoints} pts
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-[13px]">
                    <p className="text-(--text-secondary) dark:text-[#6b6560]">
                      <span className="font-bold text-(--text-primary) dark:text-(--text-primary)">
                        Your answer:
                      </span>{' '}
                      {item.yourAnswer || 'Skipped'}
                    </p>

                    {item.correctAnswer && (
                      <p className="text-(--text-secondary) dark:text-[#6b6560]">
                        <span className="font-bold text-(--text-primary) dark:text-(--text-primary)">
                          Correct answer:
                        </span>{' '}
                        {item.correctAnswer}
                      </p>
                    )}

                    {item.explanation && (
                      <p className="rounded-xl border border-(--border-subtle) bg-(--surface-canvas) p-4 leading-6 text-(--text-secondary) dark:border-white/8 dark:bg-(--surface-canvas) dark:text-(--text-secondary)">
                        {item.explanation}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </section>
          </>
        ) : (
          <div className="rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-6 text-(--text-secondary) shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card) dark:text-(--text-secondary)">
            No analysis found.
          </div>
        )}
      </div>
    </AppShellBoundary>
  )
}
