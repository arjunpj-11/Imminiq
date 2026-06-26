import { useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

import api from '../../../lib/axios'
import type {
  ApiErrorResponse,
  ApiResponse,
  CommunityPublicTrackerDetail,
  CommunityPublicTrackerDetailData,
} from '../types/community.types'

export const communityPublicTrackerKeys = {
  all: ['community', 'trackers'] as const,
  detail: (trackerId: string) =>
    [...communityPublicTrackerKeys.all, trackerId] as const,
}

const fetchCommunityPublicTracker = async (
  trackerId: string,
): Promise<CommunityPublicTrackerDetail> => {
  const response = await api.get<ApiResponse<CommunityPublicTrackerDetailData>>(
    `/community/trackers/${trackerId}`,
  )

  const tracker = response.data.data?.tracker

  if (!tracker) {
    throw new Error('Community tracker detail was not returned.')
  }

  return tracker
}

export const useCommunityPublicTracker = (trackerId?: string) => {
  return useQuery<CommunityPublicTrackerDetail, AxiosError<ApiErrorResponse>>({
    queryKey: communityPublicTrackerKeys.detail(trackerId ?? ''),
    queryFn: () => fetchCommunityPublicTracker(trackerId ?? ''),
    enabled: Boolean(trackerId),
    staleTime: 30 * 1000,
  })
}
