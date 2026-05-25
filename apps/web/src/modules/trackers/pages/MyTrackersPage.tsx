// apps/web/src/modules/trackers/pages/MyTrackersPage.tsx

import { useState, type Dispatch, type SetStateAction } from 'react'
import { useNavigate } from 'react-router-dom'

import Sidebar from '../../../components/layout/Sidebar'
import TopBar from '../../../components/layout/TopBar'
import AppFooter from '../../../components/layout/Footer'
import BottomNav from '../../../components/layout/BottomNav'

import { useDashboardSummary } from '../../dashboard/hooks/useDashboardSummary'
import {
  useArchiveTracker,
  useRestoreTracker,
  useTrackerSummary,
  useTrackers,
} from '../hooks/useTrackers'

import { useTrackerUiStore } from '../store/useTrackerUiStore'

import TrackerCard from '../components/TrackerCard'
import TrackerFilterBar from '../components/TrackerFilterBar'
import TrackerStatCard from '../components/TrackerStatCard'

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const formatLevelLabel = (isPremium: boolean) =>
  isPremium ? 'Imminiq Pro' : 'Free Scholar'

const PlusIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M7 1.5V12.5M1.5 7H12.5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
)

const CompassIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle
      cx="14"
      cy="14"
      r="10.5"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <circle cx="14" cy="14" r="1.5" fill="currentColor" />
    <path
      d="M14 4.5V6.5M14 21.5V23.5M4.5 14H6.5M21.5 14H23.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M17.5 10.5L15.5 13.5L10.5 17.5L12.5 14.5L17.5 10.5Z"
      fill="currentColor"
    />
  </svg>
)

const SkeletonBlock = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'animate-pulse rounded-full bg-[#e8ddd6] dark:bg-white/10',
      className,
    )}
  />
)

const TrackerCardSkeleton = () => (
  <div className="animate-pulse rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 dark:border-white/9 dark:bg-[#1e1c19]">
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="h-5 w-3/5 rounded-lg bg-[#e8ddd6] dark:bg-white/10" />
      <div className="h-5 w-12 rounded-full bg-[#e8ddd6] dark:bg-white/10" />
    </div>

    <div className="mb-4 h-3.5 w-4/5 rounded bg-[#e8ddd6] dark:bg-white/10" />

    <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-[#e8ddd6] dark:bg-white/10">
      <div className="h-full w-2/5 rounded-full bg-[#d4c5bc] dark:bg-white/20" />
    </div>

    <div className="flex gap-2">
      <div className="h-8 flex-1 rounded-[9px] bg-[#e8ddd6] dark:bg-white/10" />
      <div className="h-8 w-8 rounded-[9px] bg-[#e8ddd6] dark:bg-white/10" />
      <div className="h-8 w-8 rounded-[9px] bg-[#e8ddd6] dark:bg-white/10" />
    </div>
  </div>
)

const TrackerGridSkeleton = () => (
  <section className="grid grid-cols-3 gap-4 max-[1100px]:grid-cols-2 max-[700px]:grid-cols-1">
    {Array.from({ length: 6 }).map((_, i) => (
      <TrackerCardSkeleton key={i} />
    ))}
  </section>
)

const TrackerStatCardSkeleton = () => (
  <div className="rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19]">
    <SkeletonBlock className="h-3 w-20" />
    <SkeletonBlock className="mt-5 h-9 w-24 rounded-2xl" />
    <SkeletonBlock className="mt-4 h-3 w-32" />
  </div>
)

const TrackerFilterSkeleton = () => (
  <section className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-4 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19]">
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <SkeletonBlock
          key={index}
          className="h-9 w-24 rounded-[10px]"
        />
      ))}
    </div>

    <SkeletonBlock className="h-9 w-36 rounded-[10px]" />
  </section>
)

function MyTrackersPageSkeleton({
  sidebarOpen,
  sidebarCollapsed,
  setSidebarOpen,
  setSidebarCollapsed,
}: {
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  setSidebarOpen: (value: boolean) => void
  setSidebarCollapsed: Dispatch<SetStateAction<boolean>>
}) {
  return (
    <div
      className="relative min-h-screen overflow-x-clip bg-[#f5ede4] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]"
      role="status"
      aria-live="polite"
      aria-label="Loading trackers"
    >
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025] dark:opacity-[0.04]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")',
          backgroundSize: '180px',
        }}
      />

      <div className="relative z-1 flex min-h-screen w-full overflow-x-clip">
        <Sidebar
          mobileOpen={sidebarOpen}
          collapsed={sidebarCollapsed}
          onCloseMobile={() => setSidebarOpen(false)}
          onToggleCollapsed={() =>
            setSidebarCollapsed((value) => {
              const next = !value
              localStorage.setItem('imminiq_sb', next ? 'closed' : 'open')
              return next
            })
          }
        />

        <main
          className={cn(
            'flex min-w-0 flex-1 flex-col overflow-x-clip transition-[margin] duration-300',
            sidebarCollapsed
              ? 'min-[901px]:ml-0'
              : 'min-[901px]:ml-56',
          )}
        >
          <TopBar
            onMenuClick={() => setSidebarOpen(true)}
            streakDays={0}
            userName="Loading Trackers"
            userInitials="IM"
            userLevel="Loading"
            isGuest={false}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="mx-auto mt-5.5 flex w-[min(1180px,calc(100%-48px))] max-w-full min-w-0 flex-col gap-6 pb-[calc(80px+env(safe-area-inset-bottom,0)+16px)] max-[900px]:mt-4.5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[640px]:mt-3 max-[640px]:w-[calc(100%-20px)]">
              <section className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <SkeletonBlock className="mb-3 h-7 w-32 rounded-full" />
                  <SkeletonBlock className="h-10 w-[min(540px,100%)] rounded-2xl" />
                  <SkeletonBlock className="mt-3 h-4 w-[min(620px,100%)]" />
                  <SkeletonBlock className="mt-2 h-4 w-[min(480px,85%)]" />
                </div>

                <SkeletonBlock className="h-10 w-40 rounded-[10px] max-[560px]:w-full" />
              </section>

              <section className="grid grid-cols-4 gap-3 max-[860px]:grid-cols-2 max-[440px]:grid-cols-1 max-[440px]:gap-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <TrackerStatCardSkeleton key={index} />
                ))}
              </section>

              <TrackerFilterSkeleton />

              <TrackerGridSkeleton />
            </div>

            <AppFooter />
          </div>
        </main>
      </div>

      <BottomNav />

      <span className="sr-only">Loading tracker content</span>
    </div>
  )
}

export default function MyTrackersPage() {
  const navigate = useNavigate()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () =>
      typeof window !== 'undefined' &&
      localStorage.getItem('imminiq_sb') === 'closed',
  )

  const { status, setStatus } = useTrackerUiStore()

  const dashboardSummaryQuery = useDashboardSummary()
  const summaryQuery = useTrackerSummary()

  const trackersQuery = useTrackers({
    status,
    domain: 'all',
    sortBy: 'lastActive',
    page: 1,
    limit: 12,
  })

  const archiveTrackerMutation = useArchiveTracker()
  const restoreTrackerMutation = useRestoreTracker()

  const dashboardSummary = dashboardSummaryQuery.data
  const summary = summaryQuery.data
  const trackers = trackersQuery.data?.trackers || []

  const isInitialLoad =
    (dashboardSummaryQuery.isLoading && !dashboardSummary) ||
    (summaryQuery.isLoading && !summary) ||
    (trackersQuery.isLoading && !trackersQuery.data)

  const isTrackersRefetching =
    trackersQuery.isLoading || trackersQuery.isFetching

  const hasError =
    dashboardSummaryQuery.isError ||
    summaryQuery.isError ||
    trackersQuery.isError

  const handleArchiveToggle = (
    trackerId: string,
    trackerStatus?: string,
  ) => {
    if (trackerStatus === 'archived') {
      restoreTrackerMutation.mutate(trackerId)
      return
    }

    archiveTrackerMutation.mutate(trackerId)
  }

  if (isInitialLoad) {
    return (
      <MyTrackersPageSkeleton
        sidebarOpen={sidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarOpen={setSidebarOpen}
        setSidebarCollapsed={setSidebarCollapsed}
      />
    )
  }

  if (hasError || !dashboardSummary || !summary) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5ede4] px-4 dark:bg-[#141412]">
        <div className="max-w-md rounded-2xl border border-[rgba(200,50,50,0.22)] bg-[#fdf8f5] p-6 text-center shadow-[0_10px_40px_rgba(26,23,20,0.10)] dark:bg-[#1e1c19]">
          <h1 className="font-['Playfair_Display',serif] text-[22px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
            Trackers unavailable
          </h1>

          <p className="mt-2 text-[13px] leading-[1.6] text-[#6b5f58] dark:text-[#9b9a92]">
            Something went wrong while fetching your tracker data.
          </p>
        </div>
      </div>
    )
  }

  const userInitials = getInitials(dashboardSummary.user.fullName)

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#f5ede4] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]">
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025] dark:opacity-[0.04]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")',
          backgroundSize: '180px',
        }}
      />

      <div className="relative z-1 flex min-h-screen w-full overflow-x-clip">
        <Sidebar
          mobileOpen={sidebarOpen}
          collapsed={sidebarCollapsed}
          onCloseMobile={() => setSidebarOpen(false)}
          onToggleCollapsed={() =>
            setSidebarCollapsed((value) => {
              const next = !value
              localStorage.setItem('imminiq_sb', next ? 'closed' : 'open')
              return next
            })
          }
        />

        <main
          className={cn(
            'flex min-w-0 flex-1 flex-col overflow-x-clip transition-[margin] duration-300',
            sidebarCollapsed
              ? 'min-[901px]:ml-0'
              : 'min-[901px]:ml-56',
          )}
        >
          <TopBar
            onMenuClick={() => setSidebarOpen(true)}
            streakDays={dashboardSummary.streak.current}
            userName={dashboardSummary.user.fullName}
            userInitials={userInitials}
            userAvatarUrl={dashboardSummary.user.avatarUrl || undefined}
            userLevel={formatLevelLabel(dashboardSummary.user.isPremium)}
            isGuest={false}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="mx-auto mt-5.5 flex w-[min(1180px,calc(100%-48px))] max-w-full min-w-0 flex-col gap-6 pb-[calc(80px+env(safe-area-inset-bottom,0)+16px)] max-[900px]:mt-4.5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[640px]:mt-3 max-[640px]:w-[calc(100%-20px)]">
              <section className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-3 py-1 font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.12em] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
                    <span className="h-1.25 w-1.25 rounded-full bg-[#4caf7d] dark:bg-[#5cc98a]" />
                    My Trackers
                  </div>

                  <h1 className="font-['Playfair_Display',serif] text-[clamp(26px,3.5vw,38px)] font-extrabold leading-[1.15] tracking-[-0.8px] text-[#1a1714] dark:text-[#f2f0eb]">
                    Build your{' '}
                    <span className="text-[#b84c2b] dark:text-[#e8816a]">
                      zero-to-hero
                    </span>{' '}
                    learning path
                  </h1>

                  <p className="mt-2 max-w-125 text-[13px] italic leading-[1.55] text-[#6b5f58] opacity-80 dark:text-[#9b9a92]">
                    Manage your roadmaps, continue lessons, and improve your
                    learning path step by step.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/onboarding/step-1')}
                  className="inline-flex items-center gap-2 rounded-[10px] bg-[#b84c2b] px-5 py-2.5 text-[13px] font-bold text-[#fdf8f5] transition hover:-translate-y-px hover:bg-[#963d22] hover:shadow-[0_8px_24px_rgba(184,76,43,0.28)] dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a] max-[560px]:w-full max-[560px]:justify-center"
                >
                  <PlusIcon />
                  Create Tracker
                </button>
              </section>

              <section className="grid grid-cols-4 gap-3 max-[860px]:grid-cols-2 max-[440px]:grid-cols-1 max-[440px]:gap-2">
                <TrackerStatCard
                  label="Total"
                  value={summary.totalTrackers || 0}
                  helper="Created trackers"
                  tone="rust"
                />

                <TrackerStatCard
                  label="Active"
                  value={summary.activeTrackers || 0}
                  helper="In progress"
                  tone="blue"
                />

                <TrackerStatCard
                  label="Completed"
                  value={summary.completedTrackers || 0}
                  helper="Finished paths"
                  tone="green"
                />

                <TrackerStatCard
                  label="Average"
                  value={`${summary.averageProgress || 0}%`}
                  helper="Overall mastery"
                  tone="amber"
                />
              </section>

              <TrackerFilterBar status={status} onStatusChange={setStatus} />

              {isTrackersRefetching ? (
                <TrackerGridSkeleton />
              ) : trackers.length ? (
                <section className="grid grid-cols-3 gap-4 max-[1100px]:grid-cols-2 max-[700px]:grid-cols-1">
                  {trackers.map((tracker) => (
                    <TrackerCard
                      key={tracker._id}
                      tracker={tracker}
                      onOpenStudy={(trackerId) =>
                        navigate(`/trackers/${trackerId}/roadmap`)
                      }
                      onPublish={(trackerId) =>
                        navigate(`/trackers/${trackerId}/publish`)
                      }
                      onViewPublished={(trackerId) =>
                        navigate(`/trackers/${trackerId}/preview`)
                      }
                      onInfo={(trackerId) =>
                        navigate(`/trackers/${trackerId}/manage`)
                      }
                      onArchive={(trackerId) =>
                        handleArchiveToggle(trackerId, tracker.status)
                      }

                      onQuickRevision={(trackerId) => navigate(`/trackers/${trackerId}/revision`)}
                    />
                  ))}
                </section>
              ) : (
                <section className="rounded-[22px] border-[1.5px] border-dashed border-[#e0d0c5] bg-[#fdf8f5] p-10 text-center shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19] max-[640px]:p-6">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border-[1.5px] border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
                    <CompassIcon />
                  </div>

                  <h2 className="font-['Playfair_Display',serif] text-2xl font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
                    No trackers yet
                  </h2>

                  <p className="mx-auto mt-2 max-w-md text-[13px] leading-[1.6] text-[#6b5f58] dark:text-[#9b9a92]">
                    Generate your first zero-to-hero roadmap from onboarding to
                    start learning.
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate('/onboarding/step-1')}
                    className="mt-5 inline-flex items-center gap-2 rounded-[10px] bg-[#b84c2b] px-5 py-2.5 text-[13px] font-bold text-[#fdf8f5] transition hover:-translate-y-px hover:bg-[#963d22] dark:bg-[#e8816a] dark:text-[#141412]"
                  >
                    <PlusIcon />
                    Create Tracker
                  </button>
                </section>
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