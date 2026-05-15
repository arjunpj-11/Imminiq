import { useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '../../lib/axios'
import type {
  ActivityFeedItem,
  ApiErrorResponse,
  ApiResponse,
} from '../../types/profile.types'
import { activityQueryKeys } from './activity.query-keys'

interface RecentActivityResponse {
  items: ActivityFeedItem[]
}

interface UseRecentActivityOptions {
  enabled?: boolean
}

export const useRecentActivity = (
  limit = 10,
  options: UseRecentActivityOptions = {}
) => {
  return useQuery<
    ApiResponse<RecentActivityResponse>,
    AxiosError<ApiErrorResponse>,
    RecentActivityResponse
  >({
    queryKey: activityQueryKeys.recent(limit),
    enabled: options.enabled ?? true,
    queryFn: async () => {
      const response = await api.get<ApiResponse<RecentActivityResponse>>(
        '/users/me/recent-activity',
        {
          params: { limit },
        }
      )

      return response.data
    },
    select: (response) => response.data,
    staleTime: 1000 * 60 * 3,
  })
}
