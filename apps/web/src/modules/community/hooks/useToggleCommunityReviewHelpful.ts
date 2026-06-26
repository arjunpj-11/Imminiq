import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

import api from '../../../lib/axios'
import type {
  ApiErrorResponse,
  ApiResponse,
  CommunityPublicTrackerDetail,
  ToggleCommunityReviewHelpfulData,
  ToggleCommunityReviewHelpfulPayload,
} from '../types/community.types'
import { communityPublicTrackerKeys } from './useCommunityPublicTracker'

const toggleCommunityReviewHelpful = async ({
  reviewId,
}: ToggleCommunityReviewHelpfulPayload): Promise<ToggleCommunityReviewHelpfulData> => {
  const response = await api.post<ApiResponse<ToggleCommunityReviewHelpfulData>>(
    `/community/reviews/${reviewId}/helpful`,
  )

  if (!response.data.data) {
    throw new Error('Helpful state was not returned.')
  }

  return response.data.data
}

export const useToggleCommunityReviewHelpful = () => {
  const queryClient = useQueryClient()

  return useMutation<
    ToggleCommunityReviewHelpfulData,
    AxiosError<ApiErrorResponse>,
    ToggleCommunityReviewHelpfulPayload
  >({
    mutationFn: toggleCommunityReviewHelpful,
    onSuccess: (data, variables) => {
      queryClient.setQueryData<CommunityPublicTrackerDetail>(
        communityPublicTrackerKeys.detail(variables.trackerId),
        (oldData) => {
          if (!oldData) {
            return oldData
          }

          return {
            ...oldData,
            myReview:
              oldData.myReview?._id === data.review._id
                ? data.review
                : oldData.myReview,
            reviews: oldData.reviews.map((review) =>
              review._id === data.review._id ? data.review : review,
            ),
          }
        },
      )
    },
  })
}
