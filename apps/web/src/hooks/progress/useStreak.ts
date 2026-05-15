import { useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '../../lib/axios'
import type {
  ApiErrorResponse,
  ApiResponse,
  StreakSummary,
} from '../../types/profile.types'
import { streakQueryKeys } from './streak.query-keys'

interface UseStreakOptions {
  enabled?: boolean
}

export const useStreak = (
  year?: number,
  options: UseStreakOptions = {}
) => {
  return useQuery<
    ApiResponse<StreakSummary>,
    AxiosError<ApiErrorResponse>,
    StreakSummary
  >({
    queryKey: streakQueryKeys.me(year),
    enabled: options.enabled ?? true,
    queryFn: async () => {
      const response = await api.get<ApiResponse<StreakSummary>>(
        '/users/me/streak',
        {
          params: year ? { year } : undefined,
        }
      )

      return response.data
    },
    select: (response) => response.data,
    staleTime: 1000 * 60 * 10,
  })
}
