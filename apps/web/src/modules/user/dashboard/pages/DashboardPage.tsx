import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../../routes/config/route-paths';

import { AppShellBoundary } from '../../../../components/layout/AppShell';
import PageContainer from '../../../../components/layout/PageContainer';
import SkeletonBlock from '../../../../components/feedback/SkeletonBlock';
import ActivityHeatmap from '../components/ActivityHeatmap';
import CurrentRoadmapCard from '../components/CurrentRoadmapCard';
import DailyInsightCard from '../components/DailyInsightCard';
import DashboardErrorState from '../components/DashboardErrorState';
import DashboardStatsGrid from '../components/DashboardStatsGrid';
import DashboardWelcome from '../components/DashboardWelcome';
import FriendsCard from '../components/FriendsCard';
import RecentBattles from '../components/RecentBattles';
import RecommendedActions from '../components/RecommendedActions';
import { useCurrentDashboardRoadmap } from '../hooks/useCurrentDashboardRoadmap';
import { useDashboardActivityIntensity } from '../hooks/useDashboardActivityIntensity';
import { useDashboardAIInsights } from '../hooks/useDashboardAIInsights';
import { useDashboardFriendsHub } from '../hooks/useDashboardFriendsHub';
import { useDashboardRecentBattles } from '../hooks/useDashboardRecentBattles';
import { useDashboardRecommendedActions } from '../hooks/useDashboardRecommendedActions';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import { useDashboardViewState } from '../hooks/useDashboardViewState';
import { formatLevelLabel, getInitials } from '../utils/dashboard-formatters';

function DashboardMainContentSkeleton({ showDailyInsight }: { showDailyInsight: boolean }) {
  return (
    <PageContainer>
      <header className="relative overflow-hidden rounded-3xl border border-(--border-subtle) bg-(--surface-card) p-5 shadow-(--shadow-1) sm:p-7 lg:p-8">
        <div className="relative grid items-center gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(15rem,0.65fr)]">
          <div className="min-w-0">
            <SkeletonBlock className="h-7 w-40 rounded-full" />
            <SkeletonBlock className="mt-3 h-11 w-[min(32rem,88%)] rounded-xl max-[640px]:h-9" />
            <SkeletonBlock className="mt-3 h-4 w-[min(42rem,96%)]" />
            <SkeletonBlock className="mt-2 h-4 w-[min(34rem,78%)]" />
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-(--border-subtle) bg-(--surface-elevated) p-4.5 shadow-(--shadow-1)">
            <SkeletonBlock className="h-12 w-12 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1">
              <SkeletonBlock className="h-3 w-28" />
              <SkeletonBlock className="mt-2 h-8 w-24 rounded-lg" />
              <SkeletonBlock className="mt-2 h-3 w-36" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap gap-2.5">
        <SkeletonBlock className="h-10 w-36 rounded-md" />
        <SkeletonBlock className="h-10 w-32 rounded-md" />
        <SkeletonBlock className="h-10 w-40 rounded-md" />
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="surface-flat relative min-w-0 overflow-hidden p-3.5 sm:p-4.5"
          >
            <SkeletonBlock className="h-3 w-2/3" />
            <SkeletonBlock className="mt-3 h-8 w-1/2 rounded-lg" />
            <SkeletonBlock className="mt-2.5 h-3 w-4/5" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-4 max-[900px]:grid-cols-1">
        <div className="rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-6 shadow-(--shadow-1) max-[640px]:p-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1"><SkeletonBlock className="h-3 w-28" /><SkeletonBlock className="mt-2 h-6 w-2/3 rounded-lg" /><SkeletonBlock className="mt-2 h-5 w-40 rounded-full" /></div>
            <SkeletonBlock className="h-10 w-28 rounded-md" />
          </div>
          <div className="my-5 border-t border-(--border-subtle)" />
          <div className="flex justify-between"><SkeletonBlock className="h-4 w-32" /><SkeletonBlock className="h-4 w-10" /></div>
          <SkeletonBlock className="mt-3 h-2.5 w-full rounded-full" />
          <div className="mt-6 grid grid-cols-3 gap-3"><SkeletonBlock className="h-12 rounded-lg" /><SkeletonBlock className="h-12 rounded-lg" /><SkeletonBlock className="h-12 rounded-lg" /></div>
        </div>
        <div className="flex flex-col gap-4 rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-5 shadow-(--shadow-1)">
          <div className="flex justify-between"><SkeletonBlock className="h-5 w-28" /><SkeletonBlock className="h-6 w-20 rounded-full" /></div>
          <div className="space-y-2">{Array.from({ length: 4 }, (_, index) => <div key={index} className="flex items-center gap-2.5 px-2.5 py-2"><SkeletonBlock className="h-8.5 w-8.5 shrink-0 rounded-full" /><div className="flex-1"><SkeletonBlock className="h-3.5 w-2/3" /><SkeletonBlock className="mt-2 h-3 w-full" /></div></div>)}</div>
          <SkeletonBlock className="mt-auto h-10 w-full rounded-md" />
        </div>
      </div>

      <section className="rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-6 shadow-(--shadow-1) max-[640px]:p-4.5">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4"><div><SkeletonBlock className="h-6 w-40 rounded-lg" /><SkeletonBlock className="mt-2 h-3 w-64" /></div><SkeletonBlock className="h-9 w-20 rounded-md" /></div>
        <div className="overflow-hidden"><div className="flex min-w-180 gap-1">{Array.from({ length: 40 }, (_, week) => <div key={week} className="grid grid-rows-7 gap-1">{Array.from({ length: 7 }, (_, day) => <SkeletonBlock key={day} className="h-3 w-3 rounded-xs" />)}</div>)}</div></div>
        <div className="mt-4 flex gap-6"><SkeletonBlock className="h-8 w-20 rounded-lg" /><SkeletonBlock className="h-8 w-24 rounded-lg" /></div>
      </section>

      <section>
        <SkeletonBlock className="mb-3.5 h-7 w-40 rounded-lg" />
        <div className="space-y-2.5">{Array.from({ length: 3 }, (_, index) => <div key={index} className="flex items-center gap-4 rounded-2xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) px-5 py-4 shadow-(--shadow-1)"><SkeletonBlock className="h-11 w-11 shrink-0 rounded-xl" /><div className="min-w-0 flex-1"><SkeletonBlock className="h-4 w-48" /><SkeletonBlock className="mt-2 h-3 w-28" /></div><SkeletonBlock className="h-7 w-24 rounded-full" /></div>)}</div>
      </section>

      {showDailyInsight && (
        <section className="flex items-center gap-4 rounded-2xl bg-(--brand-500)/20 px-5.5 py-4"><SkeletonBlock className="h-9 w-9 shrink-0 rounded-xl" /><div className="flex-1"><SkeletonBlock className="h-3 w-24" /><SkeletonBlock className="mt-2 h-4 w-4/5" /></div><SkeletonBlock className="h-7 w-7 rounded-lg" /></section>
      )}
    </PageContainer>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();

  const { activityMonths, setActivityMonths, dailyInsightDismissed, dismissDailyInsight } =
    useDashboardViewState();

  const summaryQuery = useDashboardSummary();
  const roadmapQuery = useCurrentDashboardRoadmap();
  const activityQuery = useDashboardActivityIntensity(activityMonths);
  const battlesQuery = useDashboardRecentBattles(3);
  const friendsQuery = useDashboardFriendsHub(4);
  const actionsQuery = useDashboardRecommendedActions();
  const insightQuery = useDashboardAIInsights();

  const summary = summaryQuery.data;
  const currentRoadmap = roadmapQuery.data;
  const activity = activityQuery.data ?? [];
  const battles = battlesQuery.data ?? [];
  const friends = friendsQuery.data ?? [];
  const actions = actionsQuery.data ?? [];
  const aiInsight = insightQuery.data?.insight;

  const isMainContentLoading =
    summaryQuery.isLoading ||
    roadmapQuery.isLoading ||
    battlesQuery.isLoading ||
    friendsQuery.isLoading ||
    actionsQuery.isLoading;

  const hasMainContentError =
    summaryQuery.isError ||
    roadmapQuery.isError ||
    battlesQuery.isError ||
    friendsQuery.isError ||
    actionsQuery.isError;

  const shouldShowMainSkeleton = isMainContentLoading || !summary;
  const shouldShowMainError = hasMainContentError && !isMainContentLoading;
  const userFullName = summary?.user.fullName ?? 'Learner';

  return (
    <AppShellBoundary
      viewer={{
        name: userFullName,
        initials: getInitials(userFullName),
        avatarUrl: summary?.user.avatarUrl,
        streak: summary?.streak.current ?? 0,
        levelLabel: summary ? formatLevelLabel(summary.user.isPremium) : 'Free Scholar',
      }}
    >
      {shouldShowMainSkeleton ? (
        <DashboardMainContentSkeleton showDailyInsight={!dailyInsightDismissed} />
      ) : shouldShowMainError || !summary ? (
        <PageContainer>
          <DashboardErrorState />
        </PageContainer>
      ) : (
        <PageContainer>
          <DashboardWelcome summary={summary} />

          <RecommendedActions actions={actions} onNavigate={navigate} />

          <DashboardStatsGrid summary={summary} />

          <section className="grid grid-cols-[1fr_300px] gap-4 max-[900px]:grid-cols-1">
            <CurrentRoadmapCard currentRoadmap={currentRoadmap} onNavigate={navigate} />

            <FriendsCard
              friends={friends}
              onOpenFriends={() => navigate(ROUTES.friends)}
              onOpenProfile={(username) => navigate(`/profile/${username}`)}
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
            <DailyInsightCard insight={aiInsight} onDismiss={dismissDailyInsight} />
          )}
        </PageContainer>
      )}
    </AppShellBoundary>
  );
}
