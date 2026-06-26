import { useMutation, useQueryClient } from '@tanstack/react-query'

import api from '../../../lib/axios'
import type {
  ApiResponse,
  CommunityPublicTrackerDetail,
  ToggleCommunityTrackerLikeData,
  ToggleCommunityTrackerLikePayload,
} from '../types/community.types'
import { communityPublicTrackerKeys } from './useCommunityPublicTracker'

export const useToggleCommunityTrackerLike = () => {
  const queryClient = useQueryClient()

  return useMutation<
    ApiResponse<ToggleCommunityTrackerLikeData>,
    Error,
    ToggleCommunityTrackerLikePayload
  >({
    mutationFn: async ({ trackerId }) => {
      const response = await api.post<
        ApiResponse<ToggleCommunityTrackerLikeData>
      >(`/community/trackers/${trackerId}/like`)

      return response.data
    },

    onSuccess: (response, variables) => {
      const result = response.data

      if (!result) {
        return
      }

      queryClient.setQueryData<CommunityPublicTrackerDetail>(
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