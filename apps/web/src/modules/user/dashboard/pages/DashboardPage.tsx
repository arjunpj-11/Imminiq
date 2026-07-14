import { useNavigate } from 'react-router-dom';

import { AppShellBoundary } from '../../../../components/layout/AppShell';
import PageContainer from '../../../../components/layout/PageContainer';
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

function DashboardMainContentSkeleton() {
  return (
    <PageContainer>
      <div className="h-37.5 animate-pulse rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)" />

      <div className="grid grid-cols-4 gap-4 max-[900px]:grid-cols-2 max-[520px]:grid-cols-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)"
          />
        ))}
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-4 max-[900px]:grid-cols-1">
        <div className="h-52.5 animate-pulse rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)" />
        <div className="h-52.5 animate-pulse rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)" />
      </div>

      <div className="h-75 animate-pulse rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)" />
      <div className="h-55 animate-pulse rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)" />
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
        <DashboardMainContentSkeleton />
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
              onOpenFriends={() => navigate('/friends')}
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
