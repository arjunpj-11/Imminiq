// apps/web/src/modules/community/hooks/useCommunityBrowse.ts

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

import api from '../../../lib/axios'
import { COMMUNITY_PAGE_LIMIT } from '../constants/community.constants'
import type {
  ApiErrorResponse,
  ApiResponse,
  CommunityBrowseData,
  CommunityBrowseQuery,
} from '../types/community.types'

const buildCommunityParams = (query: CommunityBrowseQuery) => {
  const params = new URLSearchParams()

  if (query.search?.trim()) params.set('search', query.search.trim())
  if (query.topics?.length) params.set('topics', query.topics.join(','))
  if (query.minRating !== null && query.minRating !== undefined) {
    params.set('minRating', String(query.minRating))
  }
  if (query.verifiedOnly) params.set('verifiedOnly', 'true')
  if (query.sort) params.set('sort', query.sort)

  params.set('page', String(query.page ?? 1))
  params.set('limit', String(query.limit ?? COMMUNITY_PAGE_LIMIT))

  return params
}

const fetchCommunityBrowse = async (
  query: CommunityBrowseQuery,
): Promise<CommunityBrowseData> => {
  const params = buildCommunityParams(query)
  const response = await api.get<ApiResponse<CommunityBrowseData>>(
    `/community?${params.toString()}`,
  )

  if (!response.data.data) {
    throw new Error('Community browse data was not returned.')
  }

  return response.data.data
}

export const useCommunityBrowse = (query: CommunityBrowseQuery) => {
  return useQuery<CommunityBrowseData, AxiosError<ApiErrorResponse>>({
    queryKey: [
      'community',
      'browse',
      query.search?.trim() ?? '',
      query.topics?.join(',') ?? '',
      query.minRating ?? 'all',
      query.verifiedOnly ? 'verified' : 'all',
      query.sort ?? 'top-rated',
      query.page ?? 1,
      query.limit ?? COMMUNITY_PAGE_LIMIT,
    ],
    queryFn: () => fetchCommunityBrowse(query),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  })
}