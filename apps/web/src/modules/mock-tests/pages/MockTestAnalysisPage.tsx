// ============================================================
// MockTestAnalysisPage.tsx — aligned with Trackers design
// ============================================================
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import Sidebar from '../../../components/layout/Sidebar'
import TopBar from '../../../components/layout/TopBar'
import AppFooter from '../../../components/layout/Footer'
import BottomNav from '../../../components/layout/BottomNav'

import { useMockTestAttemptAnalysis } from '../hooks/useMockTests'

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

export default function MockTestAnalysisPage() {
  const { attemptId = '' } = useParams()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem('imminiq_sb') === 'closed'
  )

  const query = useMockTestAttemptAnalysis(attemptId)
  const data = query.data

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

              {/* ── page header ── */}
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#e8816a]" />
                  <span className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.16em] text-[#9b9a92]">
                    Mock test
                  </span>
                </div>
                <h1 className="mt-3 font-['Playfair_Display',serif] text-[38px] font-black leading-tight text-[#f2f0eb]">
                  Attempt <span className="text-[#e8816a]">analysis</span>
                </h1>
              </div>

              {/* ── loading ── */}
              {query.isLoading ? (
                <div className="space-y-4">
                  <div className="h-52 animate-pulse rounded-2xl border border-white/10 bg-[#1c1a18]" />
                  <div className="h-36 animate-pulse rounded-2xl border border-white/10 bg-[#1c1a18]" />
                  <div className="h-36 animate-pulse rounded-2xl border border-white/10 bg-[#1c1a18]" />
                </div>
              ) : query.isError ? (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
                  Failed to load attempt analysis.
                </div>
              ) : data ? (
                <>
                  {/* ── summary card ── */}
                  <section
                    className="rounded-2xl border border-white/10 bg-[#1c1a18] p-6"
                    style={{ borderTop: `2.5px solid ${data.passed ? '#3dbf82' : '#e8816a'}` }}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <div className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.13em] text-[#9b9a92]">
                          Final score
                        </div>
                        <div className="mt-2 font-['Playfair_Display',serif] text-[54px] font-black leading-none text-[#f2f0eb]">
                          {data.scorePercentage}%
                        </div>
                      </div>

                      <div
                        className={cn(
                          'w-fit rounded-full px-4 py-2 font-["DM_Mono",monospace] text-[11px] font-bold uppercase tracking-widest',
                          data.passed
                            ? 'border border-[#3dbf82]/30 bg-[#3dbf82]/10 text-[#3dbf82]'
                            : 'border border-[#e8816a]/30 bg-[#e8816a]/10 text-[#e8816a]'
                        )}
                      >
                        {data.passed ? 'Passed' : 'Needs practice'}
                      </div>
                    </div>

                    {data.recommendations.length > 0 && (
                      <div className="mt-5 border-t border-white/8 pt-5">
                        <div className="mb-3 font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.13em] text-[#9b9a92]">
                          Recommendations
                        </div>
                        <ul className="space-y-2">
                          {data.recommendations.map((rec) => (
                            <li
                              key={rec}
                              className="flex items-start gap-2 text-[13px] leading-6 text-[#9b9a92]"
                            >
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e8816a]" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-white/8 bg-[#141412] p-4">
                        <div className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.13em] text-[#9b9a92]">
                          Strong areas
                        </div>
                        <p className="mt-2 text-[13px] font-bold text-[#3dbf82]">
                          {data.strongTopics.length
                            ? data.strongTopics.join(', ')
                            : 'Not enough data'}
                        </p>
                      </div>

                      <div className="rounded-xl border border-white/8 bg-[#141412] p-4">
                        <div className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.13em] text-[#9b9a92]">
                          Weak areas
                        </div>
                        <p className="mt-2 text-[13px] font-bold text-[#e8816a]">
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
                        className="rounded-2xl border border-white/10 bg-[#1c1a18] p-5 transition hover:-translate-y-0.5 hover:border-white/20"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.13em] text-[#9b9a92]">
                              Question {index + 1}
                            </div>
                            <h3 className="mt-2 font-['Playfair_Display',serif] text-[16px] font-black leading-snug text-[#f2f0eb]">
                              {item.question}
                            </h3>
                          </div>

                          <div
                            className={cn(
                              'shrink-0 rounded-full px-3 py-1 font-["DM_Mono",monospace] text-[10px] font-bold uppercase tracking-widest',
                              item.isCorrect
                                ? 'border border-[#3dbf82]/30 bg-[#3dbf82]/10 text-[#3dbf82]'
                                : 'border border-[#e8816a]/30 bg-[#e8816a]/10 text-[#e8816a]'
                            )}
                          >
                            {item.pointsEarned}/{item.maxPoints} pts
                          </div>
                        </div>

                        <div className="mt-4 space-y-2 text-[13px]">
                          <p className="text-[#6b6560]">
                            <span className="font-bold text-[#f2f0eb]">Your answer:</span>{' '}
                            {item.yourAnswer || 'Skipped'}
                          </p>

                          {item.correctAnswer && (
                            <p className="text-[#6b6560]">
                              <span className="font-bold text-[#f2f0eb]">Correct answer:</span>{' '}
                              {item.correctAnswer}
                            </p>
                          )}

                          {item.explanation && (
                            <p className="rounded-xl border border-white/8 bg-[#141412] p-4 leading-6 text-[#9b9a92]">
                              {item.explanation}
                            </p>
                          )}
                        </div>
                      </article>
                    ))}
                  </section>
                </>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-[#1c1a18] p-6 text-[#9b9a92]">
                  No analysis found.
                </div>
              )}

             
            </div>
             <AppFooter />
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  )
}