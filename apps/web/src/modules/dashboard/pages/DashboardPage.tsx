import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Sidebar from '../../../components/layout/Sidebar'
import TopBar from '../../../components/layout/TopBar'
import AppFooter from '../../../components/layout/Footer'
import BottomNav from '../../../components/layout/BottomNav'

import { useDashboardSummary } from '../hooks/useDashboardSummary'
import { useCurrentDashboardRoadmap } from '../hooks/useCurrentDashboardRoadmap'
import { useDashboardActivityIntensity } from '../hooks/useDashboardActivityIntensity'
import { useDashboardRecentBattles } from '../hooks/useDashboardRecentBattles'
import { useDashboardFriendsHub } from '../hooks/useDashboardFriendsHub'
import { useDashboardRecommendedActions } from '../hooks/useDashboardRecommendedActions'
import { useDashboardAIInsights } from '../hooks/useDashboardAIInsights'
import { useDashboardStore } from '../store/useDashboardStore'

import ActivityHeatmap from '../components/ActivityHeatmap'
import CurrentRoadmapCard from '../components/CurrentRoadmapCard'
import DailyInsightCard from '../components/DailyInsightCard'
import DashboardErrorState from '../components/DashboardErrorState'
import DashboardStatsGrid from '../components/DashboardStatsGrid'
import DashboardWelcome from '../components/DashboardWelcome'
import FriendsCard from '../components/FriendsCard'
import RecentBattles from '../components/RecentBattles'
import RecommendedActions from '../components/RecommendedActions'
import { cn } from '../utils/cn'
import { formatLevelLabel, getInitials } from '../utils/dashboard-formatters'

function DashboardMainContentSkeleton() {
  return (
    <div className="mx-auto mt-5.5 flex w-[min(1180px,calc(100%-48px))] max-w-full min-w-0 flex-col gap-6 pb-[calc(80px+env(safe-area-inset-bottom,0)+16px)] max-[900px]:mt-4.5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[640px]:mt-3 max-[640px]:w-[calc(100%-20px)]">
      <div className="h-37.5 animate-pulse rounded-[20px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19]" />

      <div className="grid grid-cols-4 gap-4 max-[900px]:grid-cols-2 max-[520px]:grid-cols-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-[20px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19]"
          />
        ))}
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-4 max-[900px]:grid-cols-1">
        <div className="h-52.5 animate-pulse rounded-[20px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19]" />
        <div className="h-52.5 animate-pulse rounded-[20px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19]" />
      </div>

      <div className="h-75 animate-pulse rounded-[20px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19]" />

      <div className="h-55 animate-pulse rounded-[20px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19]" />
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () =>
      typeof window !== 'undefined' &&
      localStorage.getItem('imminiq_sb') === 'closed'
  )

  const activityMonths = useDashboardStore(
    (state) => state.activityMonths
  )
  const setActivityMonths = useDashboardStore(
    (state) => state.setActivityMonths
  )
  const dailyInsightDismissed = useDashboardStore(
    (state) => state.dailyInsightDismissed
  )
  const dismissDailyInsight = useDashboardStore(
    (state) => state.dismissDailyInsight
  )

  const summaryQuery = useDashboardSummary()
  const roadmapQuery = useCurrentDashboardRoadmap()
  const activityQuery = useDashboardActivityIntensity(activityMonths)
  const battlesQuery = useDashboardRecentBattles(3)
  const friendsQuery = useDashboardFriendsHub(4)
  const actionsQuery = useDashboardRecommendedActions()
  const insightQuery = useDashboardAIInsights()

  const summary = summaryQuery.data
  const currentRoadmap = roadmapQuery.data
  const activity = activityQuery.data ?? []
  const battles = battlesQuery.data ?? []
  const friends = friendsQuery.data ?? []
  const actions = actionsQuery.data ?? []
  const aiInsight = insightQuery.data?.insight

  const isMainContentLoading =
    summaryQuery.isLoading ||
    roadmapQuery.isLoading ||
    battlesQuery.isLoading ||
    friendsQuery.isLoading ||
    actionsQuery.isLoading

  const hasMainContentError =
    summaryQuery.isError ||
    roadmapQuery.isError ||
    battlesQuery.isError ||
    friendsQuery.isError ||
    actionsQuery.isError

  const shouldShowMainSkeleton = isMainContentLoading || !summary
  const shouldShowMainError = hasMainContentError && !isMainContentLoading

  const userFullName = summary?.user.fullName ?? 'Learner'
  const userInitials = getInitials(userFullName)

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

              localStorage.setItem(
                'imminiq_sb',
                next ? 'closed' : 'open'
              )

              return next
            })
          }
        />

        <main
          className={cn(
            'flex min-w-0 flex-1 flex-col overflow-x-clip transition-[margin] duration-300',
            sidebarCollapsed
              ? 'min-[901px]:ml-0'
              : 'min-[901px]:ml-56'
          )}
        >
          <TopBar
            onMenuClick={() => setSidebarOpen(true)}
            streakDays={summary?.streak.current ?? 0}
            userName={userFullName}
            userInitials={userInitials}
            userAvatarUrl={summary?.user.avatarUrl || undefined}
            userLevel={
              summary
                ? formatLevelLabel(summary.user.isPremium)
                : 'Free'
            }
            isGuest={false}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            {shouldShowMainSkeleton ? (
              <DashboardMainContentSkeleton />
            ) : shouldShowMainError || !summary ? (
              <div className="mx-auto mt-5.5 w-[min(1180px,calc(100%-48px))] max-w-full pb-[calc(80px+env(safe-area-inset-bottom,0)+16px)] max-[900px]:mt-4.5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[640px]:mt-3 max-[640px]:w-[calc(100%-20px)]">
                <DashboardErrorState />
              </div>
            ) : (
              <div className="mx-auto mt-5.5 flex w-[min(1180px,calc(100%-48px))] max-w-full min-w-0 flex-col gap-6 pb-[calc(80px+env(safe-area-inset-bottom,0)+16px)] max-[900px]:mt-4.5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[640px]:mt-3 max-[640px]:w-[calc(100%-20px)]">
                <DashboardWelcome summary={summary} />

                <RecommendedActions
                  actions={actions}
                  onNavigate={navigate}
                />

                <DashboardStatsGrid summary={summary} />

                <section className="grid grid-cols-[1fr_300px] gap-4 max-[900px]:grid-cols-1">
                  <CurrentRoadmapCard
                    currentRoadmap={currentRoadmap}
                    summary={summary}
                    onNavigate={navigate}
                  />

                  <FriendsCard
                    friends={friends}
                    onOpenCommunity={() => navigate('/community')}
                  />
                </section>

                <ActivityHeatmap
                  activity={activity}
                  months={activityMonths}
                  onMonthsChange={setActivityMonths}
                  isLoading={activityQuery.isFetching}
                />

                <RecentBattles battles={battles} />

                {!dailyInsightDismissed && (
                  <DailyInsightCard
                    insight={aiInsight}
                    onDismiss={dismissDailyInsight}
                  />
                )}
              </div>
            )}

            <AppFooter />
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  )
}