import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import api from '../../../../lib/axios';
import { FRIENDS_ENDPOINTS } from '../constants/friends.constants';
import type {
  IFriendsApiErrorResponse,
  IFriendsApiResponse,
  ISendFriendRequestInput,
  ISendFriendRequestResponse,
} from '../types/friends.types';
import { friendsQueryKeys } from './friends-query-keys';

export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ISendFriendRequestResponse,
    AxiosError<IFriendsApiErrorResponse>,
    ISendFriendRequestInput
  >({
    mutationFn: async (input) => {
      const response = await api.post<IFriendsApiResponse<ISendFriendRequestResponse>>(
        FRIENDS_ENDPOINTS.requests,
        input
      );

      return response.data.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: friendsQueryKeys.searches(),
        }),
        queryClient.invalidateQueries({
          queryKey: friendsQueryKeys.requests(),
        }),
      ]);
    },
  });
};
