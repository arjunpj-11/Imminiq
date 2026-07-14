import { useInfiniteQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import api from '../../../../lib/axios';
import { FRIENDS_ENDPOINTS, FRIENDS_STALE_TIME_MS } from '../constants/friends.constants';
import type {
  IFriendRequestListPage,
  IFriendRequestsQueryInput,
  IFriendRequestsResponse,
  IFriendsApiErrorResponse,
  IFriendsApiResponse,
} from '../types/friends.types';
import { friendsQueryKeys } from './friends.query-keys';

export const useSentFriendRequests = (input: IFriendRequestsQueryInput) =>
  useInfiniteQuery<IFriendRequestListPage, AxiosError<IFriendsApiErrorResponse>>({
    queryKey: friendsQueryKeys.sentRequests(input),
    queryFn: async ({ pageParam }) => {
      const page = typeof pageParam === 'number' ? pageParam : 1;
      const response = await api.get<IFriendsApiResponse<IFriendRequestsResponse>>(
        FRIENDS_ENDPOINTS.requests,
        {
          params: {
            receivedPage: 1,
            sentPage: page,
            limit: input.limit,
          },
        }
      );

      return response.data.data.sent;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    staleTime: FRIENDS_STALE_TIME_MS,
    retry: 1,
  });
