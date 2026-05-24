import { useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '../../../lib/axios'
import type {
  ApiErrorResponse,
  ApiResponse,
  PaginatedResult,
  PublishedTracker,
} from '../types/profile.types'
import { profileQueryKeys } from './profile.query-keys'

export interface PublishedTrackerQuery {
  page?: number
  limit?: number
  search?: string
  status?: 'active' | 'draft' | 'archived'
  sort?: 'createdAt' | 'publishedAt' | 'ratingAverage' | 'cloneCount'
}

interface UsePublishedTrackersOptions {
  enabled?: boolean
}

export const usePublishedTrackers = (
  params: PublishedTrackerQuery = { page: 1, limit: 6 },
  options: UsePublishedTrackersOptions = {}
) => {
  const normalizedParams = {
    page: params.page ?? 1,
    limit: params.limit ?? 6,
    search: params.search ?? '',
    status: params.status,
    sort: params.sort ?? 'publishedAt',
  }

  return useQuery<
    ApiResponse<PaginatedResult<PublishedTracker>>,
    AxiosError<ApiErrorResponse>,
    PaginatedResult<PublishedTracker>
  >({
    queryKey: profileQueryKeys.trackers(normalizedParams),
    enabled: options.enabled ?? true,
    queryFn: async () => {
      const response = await api.get<
        ApiResponse<PaginatedResult<PublishedTracker>>
      >('/users/me/published-trackers', {
        params: normalizedParams,
      })

      return response.data
    },
    select: (response) => response.data,
    staleTime: 1000 * 60 * 5,
  })
}
