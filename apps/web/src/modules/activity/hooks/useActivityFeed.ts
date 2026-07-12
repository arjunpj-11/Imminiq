import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

import api from '../../../lib/axios'
import {
  ACTIVITY_ENDPOINTS,
  ACTIVITY_STALE_TIME_MS,
} from '../constants/activity.constants'
import type {
  IActivityApiErrorResponse,
  IActivityApiResponse,
  IActivityFeedQueryInput,
  IActivityFeedResponse,
} from '../types/activity.types'
import { activityQueryKeys } from './activity-query-keys'

interface IUseActivityFeedOptions extends IActivityFeedQueryInput {
  /**
   * Only pass this when it is known to belong to the SAME filter/year
   * this hook is being called with (i.e. the parent page query is not
   * showing placeholder/previous-filter data). Passing feed data that
   * belongs to a different filter than `input.filter` will make TanStack
   * Query treat the wrong data as fresh for the new query key and skip
   * the real fetch — that was the cause of the "filter doesn't update"
   * bug. When in doubt, omit it.
   */
  initialFeed?: IActivityFeedResponse
  initialDataUpdatedAt?: number
}

export const useActivityFeed = ({
  initialFeed,
  initialDataUpdatedAt,
  ...input
}: IUseActivityFeedOptions) =>
  useInfiniteQuery<
    IActivityFeedResponse,
    AxiosError<IActivityApiErrorResponse>
  >({
    queryKey: activityQueryKeys.feed(input),
    queryFn: async ({ pageParam }) => {
      const cursor =
        typeof pageParam === 'string' ? pageParam : undefined

      const response = await api.get<
        IActivityApiResponse<IActivityFeedResponse>
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
    // Seed the cache ONLY when the caller has confirmed initialFeed
    // actually matches this filter/year — otherwise a stale/mismatched
    // feed gets stamped "fresh" for the new query key and the real
    // fetch never fires. See the comment on UseActivityFeedOptions.
    ...(initialFeed
      ? {
          initialData: {
            pages: [initialFeed],
            pageParams: [null],
          },
          ...(initialDataUpdatedAt !== undefined
            ? { initialDataUpdatedAt }
            : {}),
        }
      : {}),
    // While a new filter's first page is loading, keep rendering the
    // previous filter's items instead of collapsing to a loading state.
    // This is what makes filter switches feel instant/smooth instead of
    // flashing empty -> skeleton -> content.
    placeholderData: keepPreviousData,
    staleTime: ACTIVITY_STALE_TIME_MS,
    retry: 1,
  })
