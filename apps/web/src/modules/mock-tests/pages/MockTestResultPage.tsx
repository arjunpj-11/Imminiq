// MockTestResultPage.tsx
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

  return (
    // ← min-h-screen, NO overflow-hidden: entire page scrolls naturally
    <div className="relative min-h-screen bg-[#141412] text-[#f2f0eb]">
      <NoiseOverlay />

      <div className="relative z-10 flex min-h-screen w-full">
        <Sidebar
          mobileOpen={sidebarOpen}
          collapsed={sidebarCollapsed}
          onCloseMobile={() => setSidebarOpen(false)}
          onToggleCollapsed={() =>
            setSidebarCollapsed((c) => {
              const next = !c
              if (typeof window !== 'undefined')
                localStorage.setItem('imminiq_sb', next ? 'closed' : 'open')
              return next
            })
          }
        />

      <main
  className={cn(
    'flex min-w-0 flex-1 flex-col transition-[margin] duration-300',
    sidebarCollapsed ? 'min-[901px]:ml-0' : 'min-[901px]:ml-56'
  )}
>
  <TopBar
    onMenuClick={() => setSidebarOpen(true)}
    streakDays={0}
    userName="Achu"
    userInitials="AC"
    userLevel="Free Scholar"
    isGuest={false}
  />

  {/* flex-1 + flex + items-center = vertically centres the card */}
  <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 max-[640px]:px-4">
    <div className="w-full max-w-215">

      {resultQuery.isLoading && (
        <div className="h-72 animate-pulse rounded-2xl border border-white/10 bg-[#1c1a18]" />
      )}

      {resultQuery.isError && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
          Failed to load result.
        </div>
      )}

      {!resultQuery.isLoading && !resultQuery.isError && !data && (
        <div className="rounded-2xl border border-white/10 bg-[#1c1a18] p-6 text-[#9b9a92]">
          Result not found.
        </div>
      )}

      {report && (
        <section
          className="rounded-2xl border border-white/10 bg-[#1c1a18] p-10 text-center"
          style={{ borderTop: `2.5px solid ${report.passed ? '#3dbf82' : '#e8816a'}` }}
        >
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: report.passed ? '#3dbf82' : '#e8816a' }}
            />
            <span className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.16em] text-[#9b9a92]">
              Result
            </span>
          </div>

          <div className="mt-5 font-['Playfair_Display',serif] text-[72px] font-black leading-none text-[#f2f0eb]">
            {report.scorePercentage}%
          </div>

          <div
            className={cn(
              'mx-auto mt-4 w-fit rounded-full px-4 py-2 font-["DM_Mono",monospace] text-[10px] font-bold uppercase tracking-widest',
              report.passed
                ? 'border border-[#3dbf82]/30 bg-[#3dbf82]/10 text-[#3dbf82]'
                : 'border border-[#e8816a]/30 bg-[#e8816a]/10 text-[#e8816a]'
            )}
          >
            {report.passed ? 'Passed' : 'Needs practice'}
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-4">
            {[
              { label: 'Score',   value: report.score },
              { label: 'Correct', value: report.correctAnswers },
              { label: 'Skipped', value: report.skippedAnswers },
              { label: 'Time',    value: formatDuration(report.timeTakenSeconds) },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-white/8 bg-[#141412] p-4">
                <div className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.13em] text-[#9b9a92]">
                  {label}
                </div>
                <div className="mt-2 font-['Playfair_Display',serif] text-[24px] font-black text-[#f2f0eb]">
                  {value}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => navigate(`/mock-tests/attempts/${attemptId}/analysis`)}
            className="mt-7 rounded-[14px] bg-[#e8816a] px-6 py-3 font-['Playfair_Display',serif] text-[15px] font-bold text-white transition hover:-translate-y-px hover:bg-[#d9522d]"
          >
            View analysis
          </button>
        </section>
      )}
    </div>
  </div>

  <AppFooter />
</main>
      </div>

      <BottomNav />
    </div>
  )
}