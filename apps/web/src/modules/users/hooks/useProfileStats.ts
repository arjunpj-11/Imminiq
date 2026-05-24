import { useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '../../../lib/axios'
import type {
  ApiErrorResponse,
  ApiResponse,
  ProfileStats,
} from '../types/profile.types'
import { profileQueryKeys } from './profile.query-keys'

interface UseProfileStatsOptions {
  enabled?: boolean
}

export const useProfileStats = (options: UseProfileStatsOptions = {}) => {
  return useQuery<
    ApiResponse<ProfileStats>,
    AxiosError<ApiErrorResponse>,
    ProfileStats
  >({
    queryKey: profileQueryKeys.stats(),
    enabled: options.enabled ?? true,
    queryFn: async () => {
      const response = await api.get<ApiResponse<ProfileStats>>(
        '/users/me/stats'
      )

      return response.data
    },
    select: (response) => response.data,
    staleTime: 1000 * 60 * 5,
  })
}
