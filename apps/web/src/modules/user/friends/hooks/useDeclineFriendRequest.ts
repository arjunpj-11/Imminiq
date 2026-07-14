import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import api from '../../../../lib/axios';
import { FRIENDS_ENDPOINTS } from '../constants/friends.constants';
import type {
  IFriendActionResponse,
  IFriendRequestActionInput,
  IFriendsApiErrorResponse,
  IFriendsApiResponse,
} from '../types/friends.types';
import { friendsQueryKeys } from './friends-query-keys';

export const useDeclineFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IFriendActionResponse,
    AxiosError<IFriendsApiErrorResponse>,
    IFriendRequestActionInput
  >({
    mutationFn: async ({ requestId }) => {
      const response = await api.patch<IFriendsApiResponse<IFriendActionResponse>>(
        FRIENDS_ENDPOINTS.declineRequest(requestId)
      );

      return response.data.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: friendsQueryKeys.requests(),
        }),
        queryClient.invalidateQueries({
          queryKey: friendsQueryKeys.searches(),
        }),
      ]);
    },
  });
};
