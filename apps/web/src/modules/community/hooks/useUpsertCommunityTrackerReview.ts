import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

import api from '../../../lib/axios'
import type {
  ApiErrorResponse,
  ApiResponse,
  CommunityPublicTrackerDetail,
  UpsertCommunityTrackerReviewData,
  UpsertCommunityTrackerReviewPayload,
} from '../types/community.types'
import { communityPublicTrackerKeys } from './useCommunityPublicTracker'

const upsertCommunityTrackerReview = async ({
  trackerId,
  rating,
  comment,
}: UpsertCommunityTrackerReviewPayload): Promise<UpsertCommunityTrackerReviewData> => {
  const response = await api.post<
    ApiResponse<UpsertCommunityTrackerReviewData>
  >(`/community/trackers/${trackerId}/reviews`, {
    rating,
    comment,
  })

  if (!response.data.data) {
    throw new Error('Submitted review was not returned.')
  }

  return response.data.data
}

export const useUpsertCommunityTrackerReview = () => {
  const queryClient = useQueryClient()

  return useMutation<
    UpsertCommunityTrackerReviewData,
    AxiosError<ApiErrorResponse>,
    UpsertCommunityTrackerReviewPayload
  >({
    mutationFn: upsertCommunityTrackerReview,
    onSuccess: (data, variables) => {
      queryClient.setQueryData<CommunityPublicTrackerDetail>(
        communityPublicTrackerKeys.detail(variables.trackerId),
        (oldData) => {
          if (!oldData) {
            return oldData
          }

          const withoutMine = oldData.reviews.filter(
            (review) => review._id !== data.review._id && !review.isMine,
          )

          return {
            ...oldData,
            ratingSummary: data.ratingSummary,
            myReview: data.review,
            reviews: [data.review, ...withoutMine],
          }
        },
      )

      void queryClient.invalidateQueries({ queryKey: ['community', 'browse'] })
    },
  })
}
