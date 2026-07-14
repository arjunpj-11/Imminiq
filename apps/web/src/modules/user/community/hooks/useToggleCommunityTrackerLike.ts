import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '../../../../lib/axios';
import { COMMUNITY_ENDPOINTS } from '../constants/community.constants';
import type {
  IApiResponse,
  ICommunityPublicTrackerDetail,
  IToggleCommunityTrackerLikeData,
  IToggleCommunityTrackerLikePayload,
} from '../types/community.types';
import { communityKeys } from './community.query-keys';

export const useToggleCommunityTrackerLike = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IApiResponse<IToggleCommunityTrackerLikeData>,
    Error,
    IToggleCommunityTrackerLikePayload
  >({
    mutationFn: async ({ trackerId }) => {
      const response = await api.post<IApiResponse<IToggleCommunityTrackerLikeData>>(
        COMMUNITY_ENDPOINTS.likeTracker(trackerId)
      );

      return response.data;
    },

    onSuccess: (response, variables) => {
      const result = response.data;

      if (!result) {
        return;
      }

      queryClient.setQueryData<ICommunityPublicTrackerDetail>(
        communityKeys.tracker(variables.trackerId),
        (oldData) => {
          if (!oldData) {
            return oldData;
          }

          return {
            ...oldData,
            likes: result.likes,
            likedByMe: result.liked,
          };
        }
      );
    },
  });
};
