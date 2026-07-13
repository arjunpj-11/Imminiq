import { useMemo } from 'react';

import { useActivityFeed } from '../hooks/useActivityFeed';
import type { ActivityFeedFilter, IActivityPageResponse } from '../types/activity.types';
import { mergeActivityFeedPages } from '../utils/activity-formatters';
import ActivityFeed from './ActivityFeed';
import ActivityFilterTabs from './ActivityFilterTabs';
import ActivityHeader from './ActivityHeader';
import ActivityHeatmap from './ActivityHeatmap';
import ActivitySidebar from './ActivitySidebar';
import ActivityStatsGrid from './ActivityStatsGrid';

interface IActivityDashboardProps {
  activity: IActivityPageResponse;
  filter: ActivityFeedFilter;
  year: number;
  utcOffsetMinutes: number;
  isPageFetching: boolean;
  /**
   * True while `activity` is still showing the PREVIOUS filter/year's
   * data (TanStack Query's `keepPreviousData` placeholder) because the
   * page query for the current filter/year hasn't resolved yet. When
   * true, `activity.feed` does not belong to `filter` and must not be
   * fed into useActivityFeed as initial data.
   */
  isPageDataStale: boolean;
  onFilterChange: (filter: ActivityFeedFilter) => void;
  onYearChange: (year: number) => void;
}

export default function ActivityDashboard({
  activity,
  filter,
  year,
  utcOffsetMinutes,
  isPageFetching,
  isPageDataStale,
  onFilterChange,
  onYearChange,
}: IActivityDashboardProps) {
  const generatedAtMs = Date.parse(activity.generatedAt);

  /**
   * React components must remain pure during rendering.
   *
   * Do not use Date.now() here because it produces a different value
   * between renders and triggers the react-hooks/purity rule.
   *
   * A value of 0 tells TanStack Query that the initial data is old,
   * allowing it to refetch when generatedAt is invalid.
   */
  const initialDataUpdatedAt = Number.isNaN(generatedAtMs) ? 0 : generatedAtMs;

  const feedQuery = useActivityFeed({
    filter,
    limit: activity.feed.pagination.limit,
    utcOffsetMinutes,
    // Only hand the feed query a starting point when we're sure it
    // actually belongs to `filter` — see isPageDataStale above. This is
    // the fix for filter switches silently showing stale/wrong data.
    ...(isPageDataStale ? {} : { initialFeed: activity.feed, initialDataUpdatedAt }),
  });

  const feedGroups = useMemo(
    () => mergeActivityFeedPages(feedQuery.data?.pages ?? [activity.feed]),
    [activity.feed, feedQuery.data?.pages]
  );

  const isUpdating = (isPageFetching || feedQuery.isFetching) && !feedQuery.isFetchingNextPage;

  return (
    <>
      <ActivityHeader currentStreak={activity.streak.currentStreak} />

      <ActivityStatsGrid stats={activity.stats} />

      <ActivityHeatmap
        streak={activity.streak}
        year={year}
        accountCreatedAt={activity.user.accountCreatedAt}
        isFetching={isPageFetching}
        onYearChange={onYearChange}
      />

      <div className="flex items-start gap-5 max-[860px]:flex-col">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ActivityFilterTabs
              activeFilter={filter}
              disabled={isPageFetching}
              onChange={onFilterChange}
            />

            <div
              className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#b0a097] opacity-0 transition-opacity duration-200 data-[visible=true]:opacity-100 dark:text-[#6b6460]"
              data-visible={isUpdating}
              role="status"
              aria-live="polite"
            >
              Updating activity…
            </div>
          </div>

          <ActivityFeed
            groups={feedGroups}
            hasMore={Boolean(feedQuery.hasNextPage)}
            isFetchingNextPage={feedQuery.isFetchingNextPage}
            isFetchNextPageError={feedQuery.isFetchNextPageError}
            onLoadMore={() => {
              void feedQuery.fetchNextPage();
            }}
          />
        </div>

        <ActivitySidebar weekly={activity.weekly} personalBests={activity.personalBests} />
      </div>
    </>
  );
}
