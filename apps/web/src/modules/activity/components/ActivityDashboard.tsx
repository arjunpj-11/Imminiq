import { useMemo } from 'react'

import type {
  ActivityFeedFilter,
  ActivityPageResponse,
} from '../types/activity.types'
import { useActivityFeed } from '../hooks/useActivityFeed'
import { mergeActivityFeedPages } from '../utils/activity-formatters'
import ActivityFeed from './ActivityFeed'
import ActivityFilterTabs from './ActivityFilterTabs'
import ActivityHeader from './ActivityHeader'
import ActivityHeatmap from './ActivityHeatmap'
import ActivitySidebar from './ActivitySidebar'
import ActivityStatsGrid from './ActivityStatsGrid'

interface ActivityDashboardProps {
  activity: ActivityPageResponse
  filter: ActivityFeedFilter
  year: number
  utcOffsetMinutes: number
  isPageFetching: boolean
  onFilterChange: (filter: ActivityFeedFilter) => void
  onYearChange: (year: number) => void
}

export default function ActivityDashboard({
  activity,
  filter,
  year,
  utcOffsetMinutes,
  isPageFetching,
  onFilterChange,
  onYearChange,
}: ActivityDashboardProps) {
  const generatedAtMs = Date.parse(activity.generatedAt)

  const feedQuery = useActivityFeed({
    filter,
    limit: activity.feed.pagination.limit,
    utcOffsetMinutes,
    initialFeed: activity.feed,
    initialDataUpdatedAt: Number.isNaN(generatedAtMs)
      ? Date.now()
      : generatedAtMs,
  })

  const feedGroups = useMemo(
    () => mergeActivityFeedPages(feedQuery.data?.pages ?? [activity.feed]),
    [activity.feed, feedQuery.data?.pages],
  )

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

            {(isPageFetching || feedQuery.isFetching) &&
              !feedQuery.isFetchingNextPage && (
                <div
                  className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.12em] text-[#b0a097] dark:text-[#6b6460]"
                  role="status"
                  aria-live="polite"
                >
                  Updating activity…
                </div>
              )}
          </div>

          <ActivityFeed
            groups={feedGroups}
            hasMore={Boolean(feedQuery.hasNextPage)}
            isFetchingNextPage={feedQuery.isFetchingNextPage}
            isFetchNextPageError={feedQuery.isFetchNextPageError}
            onLoadMore={() => void feedQuery.fetchNextPage()}
          />
        </div>

        <ActivitySidebar
          weekly={activity.weekly}
          personalBests={activity.personalBests}
          dailyGoal={activity.dailyGoal}
        />
      </div>
    </>
  )
}
