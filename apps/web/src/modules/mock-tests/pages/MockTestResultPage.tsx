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
    () =>
      typeof window !== 'undefined' &&
      localStorage.getItem('imminiq_sb') === 'closed'
  )

  const resultQuery = useMockTestAttemptResult(attemptId)
  const data = resultQuery.data
  const report = data?.report

  const resultAccent = report?.passed ? '#2d6a47' : '#b84c2b'

  return (
    <div className="relative min-h-screen bg-[#f5ede4] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]">
      <NoiseOverlay />

      <div className="relative z-10 flex min-h-screen w-full">
        <Sidebar
          mobileOpen={sidebarOpen}
          collapsed={sidebarCollapsed}
          onCloseMobile={() => setSidebarOpen(false)}
          onToggleCollapsed={() =>
            setSidebarCollapsed((current) => {
              const next = !current

              if (typeof window !== 'undefined') {
                localStorage.setItem('imminiq_sb', next ? 'closed' : 'open')
              }

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

          <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 max-[640px]:px-4">
            <div className="w-full max-w-215">
              {resultQuery.isLoading && (
                <div className="h-72 animate-pulse rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/10 dark:bg-[#1c1a18]" />
              )}

              {resultQuery.isError && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-600 dark:text-red-300">
                  Failed to load result.
                </div>
              )}

              {!resultQuery.isLoading && !resultQuery.isError && !data && (
                <div className="rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] p-6 text-[#6b5f58] shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/10 dark:bg-[#1c1a18] dark:text-[#9b9a92]">
                  Result not found.
                </div>
              )}

              {report && (
                <section
                  className="rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] p-10 text-center shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/10 dark:bg-[#1c1a18]"
                  style={{ borderTop: `2.5px solid ${resultAccent}` }}
                >
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        background: report.passed ? '#2d6a47' : '#b84c2b',
                      }}
                    />

                    <span className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.16em] text-[#6b5f58] dark:text-[#9b9a92]">
                      Result
                    </span>
                  </div>

                  <div className="mt-5 font-['Playfair_Display',serif] text-[72px] font-black leading-none text-[#1a1714] dark:text-[#f2f0eb]">
                    {report.scorePercentage}%
                  </div>

                  <div
                    className={cn(
                      'mx-auto mt-4 w-fit rounded-full px-4 py-2 font-["DM_Mono",monospace] text-[10px] font-bold uppercase tracking-widest',
                      report.passed
                        ? 'border border-[rgba(45,106,71,0.22)] bg-[rgba(45,106,71,0.10)] text-[#2d6a47] dark:border-[#3dbf82]/30 dark:bg-[#3dbf82]/10 dark:text-[#3dbf82]'
                        : 'border border-[rgba(184,76,43,0.24)] bg-[rgba(184,76,43,0.08)] text-[#b84c2b] dark:border-[#e8816a]/30 dark:bg-[#e8816a]/10 dark:text-[#e8816a]'
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
                        className="rounded-xl border border-[#e0d0c5] bg-[#f5ede4] p-4 dark:border-white/8 dark:bg-[#141412]"
                      >
                        <div className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.13em] text-[#6b5f58] dark:text-[#9b9a92]">
                          {label}
                        </div>

                        <div className="mt-2 font-['Playfair_Display',serif] text-[24px] font-black text-[#1a1714] dark:text-[#f2f0eb]">
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
                    className="mt-7 rounded-[14px] bg-[#b84c2b] px-6 py-3 font-['Playfair_Display',serif] text-[15px] font-bold text-white shadow-[0_2px_12px_rgba(184,76,43,0.22)] transition hover:-translate-y-px hover:bg-[#963d22] dark:bg-[#e8816a] dark:shadow-none dark:hover:bg-[#d9522d]"
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