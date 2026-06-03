// ============================================================
// MockTestsPage.tsx — fully aligned with Trackers page design
// ============================================================
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Sidebar from '../../../components/layout/Sidebar'
import TopBar from '../../../components/layout/TopBar'
import AppFooter from '../../../components/layout/Footer'
import BottomNav from '../../../components/layout/BottomNav'

import GenerateMockTestPanel from '../components/GenerateMockTestPanel'
import MockTestFilters from '../components/MockTestFilters'
import MockTestRow from '../components/MockTestRow'
import MockTestStatsGrid from '../components/MockTestStatsGrid'
import {
  StatCardSkeleton,
  TestRowSkeleton,
} from '../components/MockTestSkeletons'
import { TrophyIcon } from '../components/MockTestIcons'

import {
  useMockTestAIInsights,
  useMockTestTopicBreakdown,
  useMockTests,
  useStartMockTestAttempt,
} from '../hooks/useMockTests'

import { useMockTestsStore } from '../store/mockTests.store'
import { getTestScore } from '../utils/mock-tests-formatters'

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

// noise overlay — identical across all pages
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

export default function MockTestsPage() {
  const navigate = useNavigate()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () =>
      typeof window !== 'undefined' &&
      localStorage.getItem('imminiq_sb') === 'closed'
  )

  const testsQuery = useMockTests()
  const aiInsightsQuery = useMockTestAIInsights()
  const topicBreakdownQuery = useMockTestTopicBreakdown()
  const startMutation = useStartMockTestAttempt()

  const { filter, search } = useMockTestsStore()

  const sidebarProps = {
    mobileOpen: sidebarOpen,
    collapsed: sidebarCollapsed,
    onCloseMobile: () => setSidebarOpen(false),
    onToggleCollapsed: () =>
      setSidebarCollapsed((current) => {
        const next = !current
        if (typeof window !== 'undefined') {
          localStorage.setItem('imminiq_sb', next ? 'closed' : 'open')
        }
        return next
      }),
  }

  const tests = testsQuery.data?.tests || []

  const filteredTests = useMemo(() => {
    const query = search.trim().toLowerCase()
    return tests.filter((test) => {
      const score = getTestScore(test)
      const matchesSearch =
        !query ||
        test.title.toLowerCase().includes(query) ||
        test.tags.some((tag) => tag.toLowerCase().includes(query))
      const matchesFilter =
        filter === 'All' ||
        (filter === 'Passed' && test.latestAttempt?.passed) ||
        (filter === 'High score' && score >= 85) ||
        (filter === 'In progress' &&
          test.latestAttempt?.status === 'in_progress')
      return matchesSearch && matchesFilter
    })
  }, [tests, filter, search])

  const startTest = async (testId: string) => {
    const response = await startMutation.mutateAsync(testId)
    const data = response.data
    navigate(`/mock-tests/attempts/${data.attempt._id}`, { state: data })
  }

  const weakestTopic = topicBreakdownQuery.data?.[0]
  const aiInsight =
    aiInsightsQuery.data?.insight ||
    'Complete more tests to unlock personalized insights.'

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#141412] text-[#f2f0eb]">
      <NoiseOverlay />

      <div className="relative z-1 flex min-h-screen w-full overflow-x-clip">
        <Sidebar {...sidebarProps} />

        <main
          className={cn(
            'flex min-w-0 flex-1 flex-col overflow-x-clip transition-[margin] duration-300',
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

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="mx-auto mt-5.5 flex w-[min(1180px,calc(100%-48px))] max-w-full min-w-0 flex-col gap-6 pb-[calc(80px+env(safe-area-inset-bottom,0)+16px)] max-[900px]:mt-4.5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[640px]:mt-3 max-[640px]:w-[calc(100%-20px)]">

              {/* ── page header — matches Trackers layout ── */}
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  {/* breadcrumb pill — matches "• MY TRACKERS" */}
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#e8816a]" />
                    <span className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.16em] text-[#9b9a92]">
                      Mock tests
                    </span>
                  </div>

                  {/* headline with coral keyword — matches "zero-to-hero" */}
                  <h1 className="mt-3 font-['Playfair_Display',serif] text-[38px] font-black leading-tight text-[#f2f0eb]">
                    Practice{' '}
                    <span className="text-[#e8816a]">under pressure</span>
                  </h1>

                  <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#6b6560]">
                    Generate AI mock tests, attempt timed questions, review
                    results, and track weak areas.
                  </p>
                </div>

                {/* CTA pair — matches "Published" + "Create Tracker" */}
                <div className="flex items-center gap-3 self-start">
                  <button
                    type="button"
                    onClick={() => navigate('/mock-tests/create')}
                    className="inline-flex items-center gap-2 rounded-[14px] bg-[#e8816a] px-5 py-3 font-['Playfair_Display',serif] text-[15px] font-bold text-white transition hover:-translate-y-px hover:bg-[#d9522d]"
                  >
                    <span className="text-lg leading-none">+</span>
                    Create manual test
                  </button>
                </div>
              </div>

              {/* ── stats grid ── */}
              {testsQuery.isLoading ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                </div>
              ) : (
                <MockTestStatsGrid
                  summary={
                    testsQuery.data?.summary || {
                      totalTests: 0,
                      completedAttempts: 0,
                      averageScore: 0,
                      bestScore: 0,
                      totalQuestions: 0,
                      passedAttempts: 0,
                    }
                  }
                />
              )}

              {/* ── two-column body ── */}
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
                {/* tests list */}
                <section className="space-y-4">
                  <MockTestFilters />

                  {testsQuery.isLoading ? (
                    <div className="space-y-3">
                      <TestRowSkeleton />
                      <TestRowSkeleton />
                      <TestRowSkeleton />
                    </div>
                  ) : testsQuery.isError ? (
                    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
                      Failed to load mock tests.
                    </div>
                  ) : filteredTests.length ? (
                    <div className="space-y-3">
                      {filteredTests.map((test) => (
                        <MockTestRow
                          key={test._id}
                          test={test}
                          onOpen={() => navigate(`/mock-tests/${test._id}`)}
                          onStart={() => startTest(test._id)}
                        />
                      ))}
                    </div>
                  ) : (
                    // empty state — matches Trackers card style
                    <div className="rounded-2xl border border-dashed border-white/10 bg-[#1c1a18] p-10 text-center">
                      <h3 className="font-['Playfair_Display',serif] text-[22px] font-black text-[#f2f0eb]">
                        No mock tests found
                      </h3>
                      <p className="mt-2 text-sm text-[#6b6560]">
                        Generate your first test or adjust the filter.
                      </p>
                    </div>
                  )}
                </section>

                {/* right sidebar */}
                <aside className="space-y-4">
                  <GenerateMockTestPanel />

                  {/* AI Insights card */}
                  <div className="rounded-2xl border border-white/10 bg-[#1c1a18] p-5">
                    <div className="mb-2 flex items-center gap-1.5 font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.12em] text-[#9b9a92]">
                      <TrophyIcon />
                      AI insights
                    </div>
                    <h3 className="font-['Playfair_Display',serif] text-[17px] font-black text-[#f2f0eb]">
                      {weakestTopic
                        ? `Focus: ${weakestTopic.topic}`
                        : 'Keep building consistency'}
                    </h3>
                    <p className="mt-3 text-[12.5px] leading-6 text-[#6b6560]">
                      {aiInsightsQuery.isLoading || topicBreakdownQuery.isLoading
                        ? 'Preparing your test insights...'
                        : aiInsight}
                    </p>
                  </div>
                </aside>
              </div>

            </div>
            <AppFooter />
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  )
}