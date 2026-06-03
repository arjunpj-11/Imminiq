// ============================================================
// MockTestResultPage.tsx — aligned with Trackers design
// ============================================================
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import Sidebar from '../../../components/layout/Sidebar'
import TopBar from '../../../components/layout/TopBar'
import AppFooter from '../../../components/layout/Footer'
import BottomNav from '../../../components/layout/BottomNav'

import { useMockTestAttemptResult } from '../hooks/useMockTests'
import { formatDuration } from '../utils/mock-tests-formatters'

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

const NoiseOverlay = () => (
  <div
    className="pointer-events-none fixed inset-0 z-0 opacity-[0.025] dark:opacity-[0.04]"
    style={{
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
      backgroundSize: '180px',
    }}
  />
)

function PageShell({
  sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed, children,
}: {
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (fn: (c: boolean) => boolean) => void
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#141412] text-[#f2f0eb]">
      <NoiseOverlay />
      <div className="relative z-1 flex min-h-screen w-full overflow-x-clip">
        <Sidebar
          mobileOpen={sidebarOpen}
          collapsed={sidebarCollapsed}
          onCloseMobile={() => setSidebarOpen(false)}
          onToggleCollapsed={() =>
            setSidebarCollapsed((current) => {
              const next = !current
              if (typeof window !== 'undefined') localStorage.setItem('imminiq_sb', next ? 'closed' : 'open')
              return next
            })
          }
        />
        <main
          className={cn(
            'flex min-w-0 flex-1 flex-col overflow-x-clip transition-[margin] duration-300',
            sidebarCollapsed ? 'min-[901px]:ml-0' : 'min-[901px]:ml-56'
          )}
        >
          <TopBar onMenuClick={() => setSidebarOpen(true)} streakDays={0} userName="Achu" userInitials="AC" userLevel="Free Scholar" isGuest={false} />
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="mx-auto mt-5.5 flex w-[min(860px,calc(100%-48px))] max-w-full min-w-0 flex-col gap-6 pb-[calc(80px+env(safe-area-inset-bottom,0)+16px)] max-[900px]:mt-4.5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[640px]:mt-3 max-[640px]:w-[calc(100%-20px)]">
              {children}
              <AppFooter />
            </div>
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}

export default function MockTestResultPage() {
  const { attemptId = '' } = useParams()
  const navigate = useNavigate()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem('imminiq_sb') === 'closed'
  )

  const resultQuery = useMockTestAttemptResult(attemptId)
  const data = resultQuery.data
  const report = data?.report
  const shellProps = { sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed }

  if (resultQuery.isLoading) {
    return (
      <PageShell {...shellProps}>
        <div className="h-72 animate-pulse rounded-[16px] border border-white/10 bg-[#1c1a18]" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-[16px] border border-white/10 bg-[#1c1a18]" />
          ))}
        </div>
      </PageShell>
    )
  }

  if (resultQuery.isError) {
    return (
      <PageShell {...shellProps}>
        <div className="rounded-[16px] border border-red-500/30 bg-red-500/10 p-6 text-red-300">
          Failed to load result.
        </div>
      </PageShell>
    )
  }

  if (!data || !report) {
    return (
      <PageShell {...shellProps}>
        <div className="rounded-[16px] border border-white/10 bg-[#1c1a18] p-6 text-[#9b9a92]">
          Result not found.
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell {...shellProps}>
      {/* ── result hero card ── */}
      <section
        className="rounded-[16px] border border-white/10 bg-[#1c1a18] p-7 text-center"
        style={{ borderTop: `2.5px solid ${report.passed ? '#3dbf82' : '#e8816a'}` }}
      >
        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#e8816a]" />
          <span className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.16em] text-[#9b9a92]">
            Result
          </span>
        </div>

        <div className="mt-4 font-['Playfair_Display',serif] text-[64px] font-[900] leading-none text-[#f2f0eb]">
          {report.scorePercentage}%
        </div>

        <div
          className={cn(
            'mx-auto mt-4 w-fit rounded-full px-4 py-2 font-["DM_Mono",monospace] text-[11px] font-bold uppercase tracking-[0.1em]',
            report.passed
              ? 'border border-[#3dbf82]/30 bg-[#3dbf82]/10 text-[#3dbf82]'
              : 'border border-[#e8816a]/30 bg-[#e8816a]/10 text-[#e8816a]'
          )}
        >
          {report.passed ? 'Passed' : 'Needs practice'}
        </div>

        {/* mini stats */}
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          {[
            { label: 'Score',   value: report.score },
            { label: 'Correct', value: report.correctAnswers },
            { label: 'Skipped', value: report.skippedAnswers },
            { label: 'Time',    value: formatDuration(report.timeTakenSeconds) },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-[12px] border border-white/8 bg-[#141412] p-4">
              <div className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.13em] text-[#9b9a92]">
                {label}
              </div>
              <div className="mt-2 font-['Playfair_Display',serif] text-[22px] font-[900] text-[#f2f0eb]">
                {value}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => navigate(`/mock-tests/attempts/${attemptId}/analysis`)}
          className="mt-6 rounded-[14px] bg-[#e8816a] px-5 py-3 font-['Playfair_Display',serif] text-[15px] font-bold text-white transition hover:-translate-y-px hover:bg-[#d9522d]"
        >
          View analysis
        </button>
      </section>

      {/* ── answers list ── */}
      <section className="space-y-3">
        {data.answers.map((answer, index) => (
          <article
            key={answer._id}
            className="rounded-[16px] border border-white/10 bg-[#1c1a18] p-5 transition hover:-translate-y-0.5 hover:border-white/20"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.13em] text-[#9b9a92]">
                  Question {index + 1}
                </div>
                <h3 className="mt-2 font-['Playfair_Display',serif] text-[16px] font-[900] leading-snug text-[#f2f0eb]">
                  {answer.question?.question || 'Question unavailable'}
                </h3>
              </div>

              <div
                className={cn(
                  'flex-shrink-0 rounded-full px-3 py-1 font-["DM_Mono",monospace] text-[10px] font-bold uppercase tracking-[0.1em]',
                  answer.isCorrect
                    ? 'border border-[#3dbf82]/30 bg-[#3dbf82]/10 text-[#3dbf82]'
                    : 'border border-[#e8816a]/30 bg-[#e8816a]/10 text-[#e8816a]'
                )}
              >
                {answer.pointsEarned || 0}/{answer.question?.points || 0} pts
              </div>
            </div>

            {/* your answer */}
            <p className="mt-4 rounded-[12px] border border-white/8 bg-[#141412] p-4 text-[13px] text-[#9b9a92]">
              <span className="font-bold text-[#f2f0eb]">Your answer: </span>
              {answer.answer || 'Skipped'}
            </p>

            {/* correct answer */}
            {answer.question?.correctAnswer && (
              <p className="mt-3 text-[13px] text-[#6b6560]">
                <span className="font-bold text-[#f2f0eb]">Correct answer: </span>
                {answer.question.correctAnswer}
              </p>
            )}

            {/* AI feedback */}
            {answer.aiEvaluation && (
              <div className="mt-3 rounded-[12px] border border-white/8 bg-[#141412] p-4">
                <div className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.13em] text-[#9b9a92]">
                  AI feedback
                </div>
                <p className="mt-2 text-[13px] leading-6 text-[#9b9a92]">
                  {answer.aiEvaluation.feedback}
                </p>
              </div>
            )}
          </article>
        ))}
      </section>
    </PageShell>
  )
}