import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import api from '../../../../lib/axios';
import type {
  IApiErrorResponse,
  IApiResponse,
  ICommunityPublicTrackerDetail,
  IToggleCommunityReviewHelpfulData,
  IToggleCommunityReviewHelpfulPayload,
} from '../types/community.types';
import { communityPublicTrackerKeys } from './useCommunityPublicTracker';

const toggleCommunityReviewHelpful = async ({
  reviewId,
}: IToggleCommunityReviewHelpfulPayload): Promise<IToggleCommunityReviewHelpfulData> => {
  const response = await api.post<IApiResponse<IToggleCommunityReviewHelpfulData>>(
    `/community/reviews/${reviewId}/helpful`
  );

  if (!response.data.data) {
    throw new Error('Helpful state was not returned.');
  }

  return response.data.data;
};

export const useToggleCommunityReviewHelpful = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IToggleCommunityReviewHelpfulData,
    AxiosError<IApiErrorResponse>,
    IToggleCommunityReviewHelpfulPayload
  >({
    mutationFn: toggleCommunityReviewHelpful,
    onSuccess: (data, variables) => {
      queryClient.setQueryData<ICommunityPublicTrackerDetail>(
        communityPublicTrackerKeys.detail(variables.trackerId),
        (oldData) => {
          if (!oldData) {
            return oldData;
          }

          return {
            ...oldData,
            myReview: oldData.myReview?._id === data.review._id ? data.review : oldData.myReview,
            reviews: oldData.reviews.map((review) =>
              review._id === data.review._id ? data.review : review
            ),
          };
        }
      );
    },
  });
};
