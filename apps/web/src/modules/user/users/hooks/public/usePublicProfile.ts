import { useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '../../../../../lib/axios'
import type {
  IApiErrorResponse,
  IApiResponse,
  IPublicProfilePageData,
} from '../../types/profile.types'
import { publicProfileQueryKeys } from './public-profile.query-keys'

export interface IPublicProfileQuery {
  page?: number
  limit?: number
  search?: string
  status?: 'active' | 'draft' | 'archived'
  sort?: 'createdAt' | 'publishedAt' | 'ratingAverage' | 'cloneCount'
}

interface IUsePublicProfileOptions {
  enabled?: boolean
}

export const usePublicProfile = (
  username: string,
  params: IPublicProfileQuery = { page: 1, limit: 10 },
  options: IUsePublicProfileOptions = {}
) => {
  const normalizedParams = {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    search: params.search ?? '',
    status: params.status,
    sort: params.sort ?? 'publishedAt',
  }

  return useQuery<
    IApiResponse<IPublicProfilePageData>,
    AxiosError<IApiErrorResponse>,
    IPublicProfilePageData
  >({
    queryKey: publicProfileQueryKeys.detail(username, normalizedParams),
    enabled: Boolean(username) && (options.enabled ?? true),
    queryFn: async () => {
      const response = await api.get<IApiResponse<IPublicProfilePageData>>(
        `/users/${username}/public-profile`,
        {
          params: normalizedParams,
        }
      )

      return response.data
    },
    select: (response) => response.data,
    staleTime: 1000 * 60 * 5,
  })
}
