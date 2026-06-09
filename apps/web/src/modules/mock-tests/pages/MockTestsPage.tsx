import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Sidebar from '../../../components/layout/Sidebar'
import TopBar from '../../../components/layout/TopBar'
import AppFooter from '../../../components/layout/Footer'
import BottomNav from '../../../components/layout/BottomNav'

import GenerateMockTestModal from '../components/GenerateMockTestModal'
import MockTestRow from '../components/MockTestRow'
import MockTestStatsGrid from '../components/MockTestStatsGrid'
import {
  StatCardSkeleton,
  TestRowSkeleton,
} from '../components/MockTestSkeletons'
import { TrophyIcon } from '../components/MockTestIcons'

import {
  useImportSharedMockTest,
  useMockTestAIInsights,
  useMockTestTopicBreakdown,
  useMockTests,
  useShareMockTest,
  useStartMockTestAttempt,
} from '../hooks/useMockTests'

import type { MockTest } from '../types/mock-tests.types'

const EMPTY_TESTS: MockTest[] = []
const TESTS_PER_PAGE = 6

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

const PaginationButton = ({
  children,
  disabled,
  active,
  onClick,
}: {
  children: React.ReactNode
  disabled?: boolean
  active?: boolean
  onClick: () => void
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex h-9 min-w-9 items-center justify-center rounded-[10px] border px-3 font-["DM_Mono",monospace] text-[10px] font-bold uppercase tracking-widest transition',
        active
          ? 'border-[#b84c2b] bg-[#b84c2b] text-white shadow-[0_2px_12px_rgba(184,76,43,0.22)] dark:border-[#e8816a] dark:bg-[#e8816a]'
          : 'border-[#e0d0c5] bg-[#fdf8f5] text-[#6b5f58] hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] dark:border-white/10 dark:bg-[#1c1a18] dark:text-[#9b9a92] dark:hover:border-white/20 dark:hover:text-[#f2f0eb]',
        disabled &&
          'cursor-not-allowed opacity-45 hover:border-[#e0d0c5] hover:bg-[#fdf8f5] hover:text-[#6b5f58] dark:hover:border-white/10 dark:hover:bg-[#1c1a18] dark:hover:text-[#9b9a92]'
      )}
    >
      {children}
    </button>
  )
}

export default function MockTestsPage() {
  const navigate = useNavigate()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () =>
      typeof window !== 'undefined' &&
      localStorage.getItem('imminiq_sb') === 'closed'
  )
  const [generateModalOpen, setGenerateModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const [shareToken, setShareToken] = useState('')
  const [shareMessage, setShareMessage] = useState('')
  const [importToken, setImportToken] = useState('')
  const [importMessage, setImportMessage] = useState('')

  const testsQuery = useMockTests(currentPage, TESTS_PER_PAGE)
  const aiInsightsQuery = useMockTestAIInsights()
  const topicBreakdownQuery = useMockTestTopicBreakdown()
  const startMutation = useStartMockTestAttempt()
  const shareMutation = useShareMockTest()
  const importMutation = useImportSharedMockTest()

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
  const pagination = testsQuery.data?.pagination

  const totalItems =
    pagination?.totalItems ??
    testsQuery.data?.summary?.totalTests ??
    tests.length

  const totalPages = Math.max(
    1,
    pagination?.totalPages ?? Math.ceil(totalItems / TESTS_PER_PAGE)
  )

  const canGoPrevious = currentPage > 1
  const canGoNext = currentPage < totalPages

  const startItem =
    totalItems === 0 ? 0 : (currentPage - 1) * TESTS_PER_PAGE + 1

  const endItem = Math.min(currentPage * TESTS_PER_PAGE, totalItems)

  const weakestTopic = topicBreakdownQuery.data?.[0]

  const aiInsight =
    aiInsightsQuery.data?.insight ||
    'Complete more tests to unlock personalized insights.'

  const startTest = async (testId: string) => {
    const response = await startMutation.mutateAsync(testId)
    const data = response.data

    navigate(`/mock-tests/attempts/${data.attempt._id}`, {
      state: data,
    })
  }

  const shareTest = async (testId: string) => {
    try {
      setShareMessage('')
      setShareToken('')

      const response = await shareMutation.mutateAsync(testId)

      setShareToken(response.data.shareToken)
      setShareMessage('Share token generated')
    } catch {
      setShareMessage('Failed to generate share token')
    }
  }

  const copyShareToken = async () => {
    if (!shareToken) return

    try {
      await navigator.clipboard.writeText(shareToken)
      setShareMessage('Token copied')
    } catch {
      setShareMessage('Copy failed. Select and copy the token manually.')
    }
  }

  const importSharedTest = async () => {
    const token = importToken.trim()

    if (!token) {
      setImportMessage('Enter a share token first')
      return
    }

    try {
      setImportMessage('Importing test...')

      const response = await importMutation.mutateAsync(token)
      const importedTest = response.data.test

      setImportToken('')
      setImportMessage(
        response.data.alreadyImported
          ? 'Already imported. Opening test...'
          : 'Test imported successfully'
      )

      window.setTimeout(() => {
        navigate(`/mock-tests/${importedTest._id}`)
      }, 500)
    } catch {
      setImportMessage('Invalid token or failed to import test')
    }
  }

  const goToPage = (page: number) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages)
    setCurrentPage(nextPage)
  }

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#f5ede4] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]">
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
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-3 py-1 font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.12em] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
                    <span className="h-1.25 w-1.25 rounded-full bg-[#4caf7d] dark:bg-[#5cc98a]" />
                    My Mock Tests
                  </div>

                  <h1 className="mt-3 font-['Playfair_Display',serif] text-[38px] font-black leading-tight text-[#1a1714] dark:text-[#f2f0eb]">
                    Practice{' '}
                    <span className="text-[#b84c2b] dark:text-[#e8816a]">
                      under pressure
                    </span>
                  </h1>

                  <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#6b5f58] dark:text-[#6b6560]">
                    Generate AI mock tests, attempt timed questions, review
                    results, and track weak areas.
                  </p>
                </div>

                <div className="flex items-center gap-3 self-start max-[520px]:w-full max-[520px]:flex-col">

                  <button
                    type="button"
                    onClick={() => setGenerateModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-[#b84c2b] px-5 py-3 font-['Playfair_Display',serif] text-[15px] font-bold text-white shadow-[0_2px_12px_rgba(184,76,43,0.22)] transition hover:-translate-y-px hover:bg-[#963d22] hover:shadow-[0_8px_24px_rgba(184,76,43,0.28)] max-[520px]:w-full dark:bg-[#e8816a] dark:shadow-none dark:hover:bg-[#d9522d] dark:hover:shadow-[0_8px_24px_rgba(232,129,106,0.3)]"
                  >
                    <SparklesSmall />
                    Generate test
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {/* ── Share token card ── */}
                <div className="rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] p-4 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/10 dark:bg-[#1c1a18]">
                  <div className="font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.12em] text-[#b84c2b] dark:text-[#e8816a]">
                    Share token
                  </div>

                  <p className="mt-1 text-[12.5px] text-[#6b5f58] dark:text-[#9b9a92]">
                    Click Share on any test to generate a token.
                  </p>

                  {/*
                    Always rendered — visibility:hidden keeps height stable so the
                    card never changes size when the token appears/disappears.
                    \u00A0 (non-breaking space) prevents the text node from
                    collapsing to zero height while invisible.
                  */}
                  <div
                    className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center"
                    style={{ visibility: shareToken ? 'visible' : 'hidden' }}
                  >
                    <div className="min-w-0 flex-1 select-all rounded-xl border border-[#e0d0c5] bg-white/40 px-3 py-2 font-['DM_Mono',monospace] text-[11px] text-[#1a1714] dark:border-white/10 dark:bg-black/10 dark:text-[#f2f0eb]">
                      {shareToken || '\u00A0'}
                    </div>

                    <button
                      type="button"
                      onClick={copyShareToken}
                      className="rounded-xl bg-[#b84c2b] px-4 py-2 text-[12px] font-bold text-white transition hover:bg-[#963d22] dark:bg-[#e8816a] dark:hover:bg-[#d9522d]"
                    >
                      Copy
                    </button>
                  </div>

                  <p
                    className="mt-2 text-[12px] font-bold text-[#b84c2b] dark:text-[#e8816a]"
                    style={{ visibility: shareMessage ? 'visible' : 'hidden' }}
                  >
                    {shareMessage || '\u00A0'}
                  </p>
                </div>

                {/* ── Import shared test card ── */}
                <div className="rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] p-4 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/10 dark:bg-[#1c1a18]">
                  <div className="font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.12em] text-[#b84c2b] dark:text-[#e8816a]">
                    Import shared test
                  </div>

                  <p className="mt-1 text-[12.5px] text-[#6b5f58] dark:text-[#9b9a92]">
                    Paste a token from another account to add that mock test to
                    your list.
                  </p>

                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <input
                      value={importToken}
                      onChange={(event) => setImportToken(event.target.value)}
                      placeholder="Paste share token"
                      className="min-w-0 flex-1 rounded-xl border border-[#e0d0c5] bg-white/40 px-3 py-2 text-[12px] font-semibold text-[#1a1714] outline-none transition placeholder:text-[#9b8f86] focus:border-[#e8816a] dark:border-white/10 dark:bg-black/10 dark:text-[#f2f0eb] dark:placeholder:text-[#6b6560]"
                    />

                    <button
                      type="button"
                      disabled={importMutation.isPending}
                      onClick={importSharedTest}
                      className="rounded-xl bg-[#b84c2b] px-4 py-2 text-[12px] font-bold text-white transition hover:bg-[#963d22] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#e8816a] dark:hover:bg-[#d9522d]"
                    >
                      {importMutation.isPending ? 'Importing...' : 'Import'}
                    </button>
                  </div>

                  {importMessage ? (
                    <p className="mt-2 text-[12px] font-bold text-[#b84c2b] dark:text-[#e8816a]">
                      {importMessage}
                    </p>
                  ) : null}
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
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] p-4 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/10 dark:bg-[#1c1a18]">
                    <div>
                      <h2 className="font-['Playfair_Display',serif] text-[18px] font-black text-[#1a1714] dark:text-[#f2f0eb]">
                        All mock tests
                      </h2>

                      <p className="mt-1 text-[12.5px] text-[#6b5f58] dark:text-[#6b6560]">
                        {testsQuery.isLoading
                          ? 'Loading your tests...'
                          : totalItems
                            ? `Showing ${startItem}-${endItem} of ${totalItems} tests`
                            : 'No tests created yet'}
                      </p>
                    </div>

                    {testsQuery.isFetching && !testsQuery.isLoading ? (
                      <span className="rounded-full border border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.08)] px-3 py-1 font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-widest text-[#b84c2b] dark:border-[#e8816a]/25 dark:bg-[#e8816a]/10 dark:text-[#e8816a]">
                        Updating
                      </span>
                    ) : null}
                  </div>

                  {testsQuery.isLoading ? (
                    <div className="space-y-3">
                      <TestRowSkeleton />
                      <TestRowSkeleton />
                      <TestRowSkeleton />
                    </div>
                  ) : testsQuery.isError ? (
                    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-600 dark:text-red-300">
                      Failed to load mock tests.
                    </div>
                  ) : tests.length ? (
                    <>
                      <div className="space-y-3">
                        {tests.map((test) => (
                          <MockTestRow
                            key={test._id}
                            test={test}
                            onOpen={() => navigate(`/mock-tests/${test._id}`)}
                            onShare={() => shareTest(test._id)}
                            onStart={() => startTest(test._id)}
                          />
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] p-4 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/10 dark:bg-[#1c1a18]">
                        <p className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-widest text-[#6b5f58] dark:text-[#9b9a92]">
                          Page {currentPage} of {totalPages}
                        </p>

                        <div className="flex flex-wrap items-center gap-2">
                          <PaginationButton
                            disabled={!canGoPrevious}
                            onClick={() => goToPage(currentPage - 1)}
                          >
                            Prev
                          </PaginationButton>

                          {Array.from({ length: totalPages })
                            .slice(0, 5)
                            .map((_, index) => {
                              const page = index + 1

                              return (
                                <PaginationButton
                                  key={page}
                                  active={page === currentPage}
                                  onClick={() => goToPage(page)}
                                >
                                  {page}
                                </PaginationButton>
                              )
                            })}

                          {totalPages > 5 ? (
                            <span className="px-1 font-['DM_Mono',monospace] text-[10px] text-[#6b5f58] dark:text-[#9b9a92]">
                              ...
                            </span>
                          ) : null}

                          <PaginationButton
                            disabled={!canGoNext}
                            onClick={() => goToPage(currentPage + 1)}
                          >
                            Next
                          </PaginationButton>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[#e0d0c5] bg-[#fdf8f5] p-10 text-center shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/10 dark:bg-[#1c1a18]">
                      <h3 className="font-['Playfair_Display',serif] text-[22px] font-black text-[#1a1714] dark:text-[#f2f0eb]">
                        No mock tests found
                      </h3>

                      <p className="mt-2 text-sm text-[#6b5f58] dark:text-[#6b6560]">
                        Generate your first test or create one manually.
                      </p>
                    </div>
                  )}
                </section>

                <aside className="space-y-4">
                  <div className="rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/10 dark:bg-[#1c1a18]">
                    <div className="mb-2 flex items-center gap-1.5 font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.12em] text-[#6b5f58] dark:text-[#9b9a92]">
                      <span className="text-[#b84c2b] dark:text-[#e8816a]">
                        <TrophyIcon />
                      </span>
                      AI insights
                    </div>

                    <h3 className="font-['Playfair_Display',serif] text-[17px] font-black text-[#1a1714] dark:text-[#f2f0eb]">
                      {weakestTopic
                        ? `Focus: ${weakestTopic.topic}`
                        : 'Keep building consistency'}
                    </h3>

                    <p className="mt-3 text-[12.5px] leading-6 text-[#6b5f58] dark:text-[#6b6560]">
                      {aiInsightsQuery.isLoading || topicBreakdownQuery.isLoading
                        ? 'Preparing your test insights...'
                        : aiInsight}
                    </p>

                    <button
                      type="button"
                      onClick={() => setGenerateModalOpen(true)}
                      className="mt-4 w-full rounded-xl border border-[rgba(184,76,43,0.25)] bg-[rgba(184,76,43,0.08)] py-2.5 font-['DM_Mono',monospace] text-[10px] font-bold uppercase tracking-widest text-[#b84c2b] transition hover:bg-[rgba(184,76,43,0.14)] dark:border-[#e8816a]/25 dark:bg-[#e8816a]/8 dark:text-[#e8816a] dark:hover:bg-[#e8816a]/15"
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