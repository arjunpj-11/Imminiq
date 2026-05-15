import { useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '../../lib/axios'
import type {
  ApiErrorResponse,
  ApiResponse,
  PublicProfilePageData,
} from '../../types/profile.types'
import { publicProfileQueryKeys } from './public-profile.query-keys'

export interface PublicProfileQuery {
  page?: number
  limit?: number
  search?: string
  status?: 'active' | 'draft' | 'archived'
  sort?: 'createdAt' | 'publishedAt' | 'ratingAverage' | 'cloneCount'
}

interface UsePublicProfileOptions {
  enabled?: boolean
}

export const usePublicProfile = (
  username: string,
  params: PublicProfileQuery = { page: 1, limit: 10 },
  options: UsePublicProfileOptions = {}
) => {
  const normalizedParams = {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    search: params.search ?? '',
    status: params.status,
    sort: params.sort ?? 'publishedAt',
  }

  return useQuery<
    ApiResponse<PublicProfilePageData>,
    AxiosError<ApiErrorResponse>,
    PublicProfilePageData
  >({
    queryKey: publicProfileQueryKeys.detail(username, normalizedParams),
    enabled: Boolean(username) && (options.enabled ?? true),
    queryFn: async () => {
      const response = await api.get<ApiResponse<PublicProfilePageData>>(
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
