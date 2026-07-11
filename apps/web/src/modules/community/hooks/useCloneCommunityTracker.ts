import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

import api from '../../../lib/axios'
import type {
  IApiErrorResponse,
  IApiResponse,
  ICommunityTracker,
} from '../types/community.types'

interface ICloneCommunityTrackerPayload {
  trackerId: string
}

interface ICloneCommunityTrackerData {
  tracker: ICommunityTracker
}

const cloneCommunityTracker = async (
  payload: ICloneCommunityTrackerPayload,
): Promise<ICloneCommunityTrackerData> => {
  const response = await api.post<IApiResponse<ICloneCommunityTrackerData>>(
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
    ICloneCommunityTrackerData,
    AxiosError<IApiErrorResponse>,
    ICloneCommunityTrackerPayload
  >({
    mutationFn: cloneCommunityTracker,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['community'] })
      void queryClient.invalidateQueries({ queryKey: ['trackers'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
