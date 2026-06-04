import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Sidebar from '../../../components/layout/Sidebar'
import TopBar from '../../../components/layout/TopBar'
import AppFooter from '../../../components/layout/Footer'
import BottomNav from '../../../components/layout/BottomNav'

import GenerateMockTestModal from '../components/GenerateMockTestModal'
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
import type { MockTest } from '../types/mock-tests.types'

const EMPTY_TESTS: MockTest[] = []

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

const SparklesSmall = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z"
      fill="currentColor"
    />
    <path
      d="M5 15L5.74 18.26L9 19L5.74 19.74L5 23L4.26 19.74L1 19L4.26 18.26L5 15Z"
      fill="currentColor"
      opacity="0.6"
    />
  </svg>
)

export default function MockTestsPage() {
  const navigate = useNavigate()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () =>
      typeof window !== 'undefined' &&
      localStorage.getItem('imminiq_sb') === 'closed'
  )
  const [generateModalOpen, setGenerateModalOpen] = useState(false)

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

  const tests = testsQuery.data?.tests ?? EMPTY_TESTS

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
        (filter === 'High score' && score >= 85) 
      return matchesSearch && matchesFilter
    })
  }, [tests, filter, search])

  const startTest = async (testId: string) => {
    const response = await startMutation.mutateAsync(testId)
    const data = response.data

    navigate(`/mock-tests/attempts/${data.attempt._id}`, {
      state: data,
    })
  }

  const weakestTopic = topicBreakdownQuery.data?.[0]

  const aiInsight =
    aiInsightsQuery.data?.insight ||
    'Complete more tests to unlock personalized insights.'

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#141412] text-[#f2f0eb]">
      <NoiseOverlay />

      <GenerateMockTestModal
        open={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
      />

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
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#e8816a]" />
                    <span className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.16em] text-[#9b9a92]">
                      Mock tests
                    </span>
                  </div>

                  <h1 className="mt-3 font-['Playfair_Display',serif] text-[38px] font-black leading-tight text-[#f2f0eb]">
                    Practice{' '}
                    <span className="text-[#e8816a]">under pressure</span>
                  </h1>

                  <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#6b6560]">
                    Generate AI mock tests, attempt timed questions, review
                    results, and track weak areas.
                  </p>
                </div>

                <div className="flex items-center gap-3 self-start">
                  <button
                    type="button"
                    onClick={() => navigate('/mock-tests/create')}
                    className="inline-flex items-center gap-2 rounded-[14px] border border-white/10 bg-transparent px-5 py-3 font-['Playfair_Display',serif] text-[15px] font-bold text-[#9b9a92] transition hover:border-white/20 hover:text-[#f2f0eb]"
                  >
                    <span className="text-lg leading-none">+</span>
                    Create manual test
                  </button>

                  <button
                    type="button"
                    onClick={() => setGenerateModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-[14px] bg-[#e8816a] px-5 py-3 font-['Playfair_Display',serif] text-[15px] font-bold text-white transition hover:-translate-y-px hover:bg-[#d9522d] hover:shadow-[0_8px_24px_rgba(232,129,106,0.3)]"
                  >
                    <SparklesSmall />
                    Generate test
                  </button>
                </div>
              </div>

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

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
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

                <aside className="space-y-4">
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

                    <button
                      type="button"
                      onClick={() => setGenerateModalOpen(true)}
                      className="mt-4 w-full rounded-xl border border-[#e8816a]/25 bg-[#e8816a]/8 py-2.5 font-['DM_Mono',monospace] text-[10px] font-bold uppercase tracking-widest text-[#e8816a] transition hover:bg-[#e8816a]/15"
                    >
                      ✦ Generate a test now
                    </button>
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