import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

import api from '../../../lib/axios'
import type {
  ApiErrorResponse,
  ApiResponse,
  CommunityTracker,
} from '../types/community.types'

interface CloneCommunityTrackerPayload {
  trackerId: string
}

interface CloneCommunityTrackerData {
  tracker: CommunityTracker
}

const cloneCommunityTracker = async (
  payload: CloneCommunityTrackerPayload,
): Promise<CloneCommunityTrackerData> => {
  const response = await api.post<ApiResponse<CloneCommunityTrackerData>>(
    `/community/trackers/${payload.trackerId}/clone`,
  )

  if (!response.data.data) {
    throw new Error('Cloned tracker was not returned.')
  }

  return response.data.data
}

export const useCloneCommunityTracker = () => {
  const queryClient = useQueryClient()

  return useMutation<
    CloneCommunityTrackerData,
    AxiosError<ApiErrorResponse>,
    CloneCommunityTrackerPayload
  >({
    mutationFn: cloneCommunityTracker,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['community'] })
      void queryClient.invalidateQueries({ queryKey: ['trackers'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
