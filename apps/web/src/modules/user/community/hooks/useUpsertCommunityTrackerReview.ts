import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import api from '../../../../lib/axios';
import { COMMUNITY_ENDPOINTS } from '../constants/community.constants';
import type {
  IApiErrorResponse,
  IApiResponse,
  ICommunityPublicTrackerDetail,
  IUpsertCommunityTrackerReviewData,
  IUpsertCommunityTrackerReviewPayload,
} from '../types/community.types';
import { communityKeys } from './community.query-keys';

const upsertCommunityTrackerReview = async ({
  trackerId,
  rating,
  comment,
}: IUpsertCommunityTrackerReviewPayload): Promise<IUpsertCommunityTrackerReviewData> => {
  const response = await api.post<IApiResponse<IUpsertCommunityTrackerReviewData>>(
    COMMUNITY_ENDPOINTS.trackerReviews(trackerId),
    {
      rating,
      comment,
    }
  );

  if (!response.data.data) {
    throw new Error('Submitted review was not returned.');
  }

  return response.data.data;
};

export const useUpsertCommunityTrackerReview = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IUpsertCommunityTrackerReviewData,
    AxiosError<IApiErrorResponse>,
    IUpsertCommunityTrackerReviewPayload
  >({
    mutationFn: upsertCommunityTrackerReview,
    onSuccess: (data, variables) => {
      queryClient.setQueryData<ICommunityPublicTrackerDetail>(
        communityKeys.tracker(variables.trackerId),
        (oldData) => {
          if (!oldData) {
            return oldData;
          }

          const withoutMine = oldData.reviews.filter(
            (review) => review._id !== data.review._id && !review.isMine
          );

          return {
            ...oldData,
            ratingSummary: data.ratingSummary,
            myReview: data.review,
            reviews: [data.review, ...withoutMine],
          };
        }
      );

      void queryClient.invalidateQueries({ queryKey: communityKeys.browseRoot() });
    },
  });
};
