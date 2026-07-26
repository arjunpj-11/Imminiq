import { useMemo } from 'react';
import { useSearchParams } from 'react-router';

import ActivityAppShell from '../components/ActivityAppShell';
import ActivityDashboard from '../components/ActivityDashboard';
import { ActivityContentSkeleton, ActivityErrorState } from '../components/ActivityStates';
import { ACTIVITY_DEFAULT_FEED_LIMIT } from '../constants/activity.constants';
import { useActivityPage } from '../hooks/useActivityPage';
import type { ActivityFeedFilter } from '../types/activity.types';
import {
  getBrowserUtcOffsetMinutes,
  parseActivityFilter,
  parseActivityYear,
} from '../utils/activity-formatters';

export default function ActivityPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = parseActivityFilter(searchParams.get('filter'));
  const year = parseActivityYear(searchParams.get('year'));
  const utcOffsetMinutes = useMemo(() => getBrowserUtcOffsetMinutes(), []);

  const activityQuery = useActivityPage({
    year,
    filter,
    limit: ACTIVITY_DEFAULT_FEED_LIMIT,
    utcOffsetMinutes,
  });

  const updateSearchParams = (nextYear: number, nextFilter: ActivityFeedFilter) => {
    setSearchParams(
      {
        year: String(nextYear),
        filter: nextFilter,
      },
      {
        replace: true,
      }
    );
  };

  const activity = activityQuery.data;
  const viewer = activity
    ? {
        name: activity.user.fullName,
        ...(activity.user.avatarUrl !== undefined ? { avatarUrl: activity.user.avatarUrl } : {}),
        streak: activity.streak.currentStreak,
        isPremium: activity.user.isPremium,
      }
    : undefined;

  return (
    <ActivityAppShell {...(viewer ? { viewer } : {})}>
      <div className="mx-auto mt-6 flex w-[min(1180px,calc(100%-48px))] max-w-full min-w-0 flex-col gap-7 pb-[calc(80px+env(safe-area-inset-bottom,0)+24px)] max-[900px]:mt-5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[640px]:mt-4 max-[640px]:w-[calc(100%-20px)]">
        {activityQuery.isPending ? (
          <ActivityContentSkeleton />
        ) : activityQuery.isError || !activity ? (
          <ActivityErrorState
            {...(activityQuery.error?.response?.data?.message
              ? {
                  message: activityQuery.error.response.data.message,
                }
              : {})}
            onRetry={() => void activityQuery.refetch()}
          />
        ) : (
          <ActivityDashboard
            activity={activity}
            filter={filter}
            year={year}
            utcOffsetMinutes={utcOffsetMinutes}
            isPageFetching={activityQuery.isFetching}
            isPageDataStale={activityQuery.isPlaceholderData}
            onFilterChange={(nextFilter) => updateSearchParams(year, nextFilter)}
            onYearChange={(nextYear) => updateSearchParams(nextYear, filter)}
          />
        )}
      </div>
    </ActivityAppShell>
  );
}
