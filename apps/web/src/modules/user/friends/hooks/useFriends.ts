import { useInfiniteQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import api from '../../../../lib/axios';
import { FRIENDS_ENDPOINTS, FRIENDS_STALE_TIME_MS } from '../constants/friends.constants';
import type {
  IFriendUsersPage,
  IFriendsApiErrorResponse,
  IFriendsApiResponse,
  IFriendsListQueryInput,
} from '../types/friends.types';
import { friendsQueryKeys } from './friends.query-keys';

export const useFriends = (input: IFriendsListQueryInput) =>
  useInfiniteQuery<IFriendUsersPage, AxiosError<IFriendsApiErrorResponse>>({
    queryKey: friendsQueryKeys.list(input),
    queryFn: async ({ pageParam }) => {
      const page = typeof pageParam === 'number' ? pageParam : 1;
      const response = await api.get<IFriendsApiResponse<IFriendUsersPage>>(
        FRIENDS_ENDPOINTS.root,
        {
          params: {
            page,
            limit: input.limit,
            ...(input.search ? { q: input.search } : {}),
          },
        }
      );

      return response.data.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    staleTime: FRIENDS_STALE_TIME_MS,
    retry: 1,
  });
