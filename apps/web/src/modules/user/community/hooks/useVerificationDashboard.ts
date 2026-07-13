import { useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

import api from '../../../../lib/axios'
import { COMMUNITY_VERIFY_PAGE_LIMIT } from '../constants/community.constants'
import type {
  IApiErrorResponse,
  IApiResponse,
  ICommunityVerificationDashboardData,
} from '../types/community.types'

interface IVerificationDashboardQuery {
  page?: number
  limit?: number
}

const fetchVerificationDashboard = async (
  query: IVerificationDashboardQuery,
): Promise<ICommunityVerificationDashboardData> => {
  const params = new URLSearchParams()

  params.set('page', String(query.page ?? 1))
  params.set('limit', String(query.limit ?? COMMUNITY_VERIFY_PAGE_LIMIT))

  const response = await api.get<
    IApiResponse<ICommunityVerificationDashboardData>
  >(`/community/verify/dashboard?${params.toString()}`)

  if (!response.data.data) {
    throw new Error('Verification dashboard data was not returned.')
  }

  return response.data.data
}

export const useVerificationDashboard = (
  query: IVerificationDashboardQuery,
) => {
  return useQuery<
    ICommunityVerificationDashboardData,
    AxiosError<IApiErrorResponse>
  >({
    queryKey: ['community', 'verify', 'dashboard', query],
    queryFn: () => fetchVerificationDashboard(query),
    staleTime: 30 * 1000,
  })
}
