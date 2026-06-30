import { useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

import api from '../../../lib/axios'
import {
  ACTIVITY_ENDPOINTS,
  ACTIVITY_STALE_TIME_MS,
} from '../constants/activity.constants'
import type {
  ActivityApiErrorResponse,
  ActivityApiResponse,
  ActivityPageQueryInput,
  ActivityPageResponse,
} from '../types/activity.types'
import { activityQueryKeys } from './activity-query-keys'

export const useActivityPage = (input: ActivityPageQueryInput) =>
  useQuery<
    ActivityPageResponse,
    AxiosError<ActivityApiErrorResponse>
  >({
    queryKey: activityQueryKeys.page(input),
    queryFn: async () => {
      const response = await api.get<
        ActivityApiResponse<ActivityPageResponse>
      >(ACTIVITY_ENDPOINTS.page, {
        params: {
          year: input.year,
          filter: input.filter,
          limit: input.limit,
          utcOffsetMinutes: input.utcOffsetMinutes,
        },
      })

      return response.data.data
    },
    staleTime: ACTIVITY_STALE_TIME_MS,
    retry: 1,
  })
