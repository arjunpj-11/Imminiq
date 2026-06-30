import { useInfiniteQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

import api from '../../../lib/axios'
import {
  ACTIVITY_ENDPOINTS,
  ACTIVITY_STALE_TIME_MS,
} from '../constants/activity.constants'
import type {
  ActivityApiErrorResponse,
  ActivityApiResponse,
  ActivityFeedQueryInput,
  ActivityFeedResponse,
} from '../types/activity.types'
import { activityQueryKeys } from './activity-query-keys'

interface UseActivityFeedOptions extends ActivityFeedQueryInput {
  initialFeed: ActivityFeedResponse
  initialDataUpdatedAt?: number
}

export const useActivityFeed = ({
  initialFeed,
  initialDataUpdatedAt,
  ...input
}: UseActivityFeedOptions) =>
  useInfiniteQuery<
    ActivityFeedResponse,
    AxiosError<ActivityApiErrorResponse>
  >({
    queryKey: activityQueryKeys.feed(input),
    queryFn: async ({ pageParam }) => {
      const cursor =
        typeof pageParam === 'string' ? pageParam : undefined

      const response = await api.get<
        ActivityApiResponse<ActivityFeedResponse>
      >(ACTIVITY_ENDPOINTS.feed, {
        params: {
          filter: input.filter,
          limit: input.limit,
          utcOffsetMinutes: input.utcOffsetMinutes,
          ...(cursor ? { cursor } : {}),
        },
      })

      return response.data.data
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.nextCursor ?? undefined,
    initialData: {
      pages: [initialFeed],
      pageParams: [null],
    },
    ...(initialDataUpdatedAt !== undefined
      ? { initialDataUpdatedAt }
      : {}),
    staleTime: ACTIVITY_STALE_TIME_MS,
    retry: 1,
  })
