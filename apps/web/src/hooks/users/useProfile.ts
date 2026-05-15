import { useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '../../lib/axios'
import type {
  ApiErrorResponse,
  ApiResponse,
  GetMyProfileResponse,
} from '../../types/profile.types'
import { profileQueryKeys } from './profile.query-keys'

interface UseProfileOptions {
  enabled?: boolean
}

export const useProfile = (options: UseProfileOptions = {}) => {
  return useQuery<
    ApiResponse<GetMyProfileResponse>,
    AxiosError<ApiErrorResponse>,
    GetMyProfileResponse
  >({
    queryKey: profileQueryKeys.me(),
    enabled: options.enabled ?? true,
    queryFn: async () => {
      const response = await api.get<ApiResponse<GetMyProfileResponse>>(
        '/users/me'
      )

      return response.data
    },
    select: (response) => response.data,
    staleTime: 1000 * 60 * 5,
  })
}
