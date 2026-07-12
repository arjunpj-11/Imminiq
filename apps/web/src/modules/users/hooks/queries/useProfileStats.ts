import { useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '../../../../lib/axios'
import type {
  IApiErrorResponse,
  IApiResponse,
  IProfileStats,
} from '../../types/profile.types'
import { profileQueryKeys } from '../profile.query-keys'

interface IUseProfileStatsOptions {
  enabled?: boolean
}

export const useProfileStats = (options: IUseProfileStatsOptions = {}) => {
  return useQuery<
    IApiResponse<IProfileStats>,
    AxiosError<IApiErrorResponse>,
    IProfileStats
  >({
    queryKey: profileQueryKeys.stats(),
    enabled: options.enabled ?? true,
    queryFn: async () => {
      const response = await api.get<IApiResponse<IProfileStats>>(
        '/users/me/stats'
      )

      return response.data
    },
    select: (response) => response.data,
    staleTime: 1000 * 60 * 5,
  })
}
