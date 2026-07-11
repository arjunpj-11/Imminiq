import { useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '../../../lib/axios'
import type {
  IApiErrorResponse,
  IApiResponse,
  IGetMyProfileResponse,
} from '../types/profile.types'
import { profileQueryKeys } from './profile.query-keys'

interface IUseProfileOptions {
  enabled?: boolean
}

export const useProfile = (options: IUseProfileOptions = {}) => {
  return useQuery<
    IApiResponse<IGetMyProfileResponse>,
    AxiosError<IApiErrorResponse>,
    IGetMyProfileResponse
  >({
    queryKey: profileQueryKeys.me(),
    enabled: options.enabled ?? true,
    queryFn: async () => {
      const response = await api.get<IApiResponse<IGetMyProfileResponse>>(
        '/users/me'
      )

      return response.data
    },
    select: (response) => response.data,
    staleTime: 1000 * 60 * 5,
  })
}
