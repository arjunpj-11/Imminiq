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
    IToggleCommunityTrackerLikePayload,
    { previous?: ICommunityPublicTrackerDetail }
  >({
    mutationFn: async ({ trackerId }) => {
      const response = await api.post<IApiResponse<IToggleCommunityTrackerLikeData>>(
        COMMUNITY_ENDPOINTS.likeTracker(trackerId)
      );

      return response.data;
    },

    onMutate: async (variables) => {
      const queryKey = communityKeys.tracker(variables.trackerId);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ICommunityPublicTrackerDetail>(queryKey);

      queryClient.setQueryData<ICommunityPublicTrackerDetail>(queryKey, (current) =>
        current
          ? {
              ...current,
              likedByMe: !current.likedByMe,
              likes: Math.max(0, current.likes + (current.likedByMe ? -1 : 1)),
            }
          : current
      );

      return { previous };
    },

    onError: (_error, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(communityKeys.tracker(variables.trackerId), context.previous);
      }
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

    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries({ queryKey: communityKeys.tracker(variables.trackerId) });
      void queryClient.invalidateQueries({ queryKey: communityKeys.browseRoot() });
    },
  });
};
