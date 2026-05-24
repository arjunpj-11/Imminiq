import { useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '../../../lib/axios'
import type {
  ApiErrorResponse,
  ApiResponse,
  PaginatedResult,
  ProfileBadge,
} from '../types/profile.types'
import { profileQueryKeys } from './profile.query-keys'

interface UseProfileBadgesOptions {
  enabled?: boolean
}

export const useProfileBadges = (
  page = 1,
  limit = 12,
  options: UseProfileBadgesOptions = {}
) => {
  return useQuery<
    ApiResponse<PaginatedResult<ProfileBadge>>,
    AxiosError<ApiErrorResponse>,
    PaginatedResult<ProfileBadge>
  >({
    queryKey: profileQueryKeys.badges(page, limit),
    enabled: options.enabled ?? true,
    queryFn: async () => {
      const response = await api.get<
        ApiResponse<PaginatedResult<ProfileBadge>>
      >('/users/me/badges', {
        params: { page, limit },
      })

      return response.data
    },
    select: (response) => response.data,
    staleTime: 1000 * 60 * 10,
  })
}
