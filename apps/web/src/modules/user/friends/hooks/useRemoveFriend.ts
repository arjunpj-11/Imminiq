import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import api from '../../../../lib/axios';
import { FRIENDS_ENDPOINTS } from '../constants/friends.constants';
import type {
  IFriendActionResponse,
  IFriendsApiErrorResponse,
  IFriendsApiResponse,
  IRemoveFriendInput,
} from '../types/friends.types';
import { friendsQueryKeys } from './friends-query-keys';

export const useRemoveFriend = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IFriendActionResponse,
    AxiosError<IFriendsApiErrorResponse>,
    IRemoveFriendInput
  >({
    mutationFn: async ({ friendUserId }) => {
      const response = await api.delete<IFriendsApiResponse<IFriendActionResponse>>(
        FRIENDS_ENDPOINTS.removeFriend(friendUserId)
      );

      return response.data.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: friendsQueryKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: friendsQueryKeys.searches(),
        }),
      ]);
    },
  });
};
