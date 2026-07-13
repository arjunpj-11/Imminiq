import { useMutation, useQueryClient } from '@tanstack/react-query'

import api from '../../../../lib/axios'
import type {
  IApiResponse,
  ICommunityPublicTrackerDetail,
  IToggleCommunityTrackerLikeData,
  IToggleCommunityTrackerLikePayload,
} from '../types/community.types'
import { communityPublicTrackerKeys } from './useCommunityPublicTracker'

export const useToggleCommunityTrackerLike = () => {
  const queryClient = useQueryClient()

  return useMutation<
    IApiResponse<IToggleCommunityTrackerLikeData>,
    Error,
    IToggleCommunityTrackerLikePayload
  >({
    mutationFn: async ({ trackerId }) => {
      const response = await api.post<
        IApiResponse<IToggleCommunityTrackerLikeData>
      >(`/community/trackers/${trackerId}/like`)

      return response.data
    },

    onSuccess: (response, variables) => {
      const result = response.data

      if (!result) {
        return
      }

      queryClient.setQueryData<ICommunityPublicTrackerDetail>(
        communityPublicTrackerKeys.detail(variables.trackerId),
        (oldData) => {
          if (!oldData) {
            return oldData
          }

          return {
            ...oldData,
            likes: result.likes,
            likedByMe: result.liked,
          }
        },
      )
    },
  })
}