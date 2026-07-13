import { useInfiniteQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import api from '../../../../lib/axios';
import {
  FRIENDS_ENDPOINTS,
  FRIENDS_SEARCH_MIN_LENGTH,
  FRIENDS_STALE_TIME_MS,
} from '../constants/friends.constants';
import type {
  IFriendSearchQueryInput,
  IFriendUsersPage,
  IFriendsApiErrorResponse,
  IFriendsApiResponse,
} from '../types/friends.types';
import { friendsQueryKeys } from './friends-query-keys';

export const useFriendSearch = (input: IFriendSearchQueryInput) => {
  const normalizedQuery = input.query.trim();

  return useInfiniteQuery<IFriendUsersPage, AxiosError<IFriendsApiErrorResponse>>({
    queryKey: friendsQueryKeys.search({
      ...input,
      query: normalizedQuery,
    }),
    queryFn: async ({ pageParam }) => {
      const page = typeof pageParam === 'number' ? pageParam : 1;
      const response = await api.get<IFriendsApiResponse<IFriendUsersPage>>(
        FRIENDS_ENDPOINTS.search,
        {
          params: {
            q: normalizedQuery,
            page,
            limit: input.limit,
          },
        }
      );

      return response.data.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    enabled: normalizedQuery.length >= FRIENDS_SEARCH_MIN_LENGTH,
    staleTime: FRIENDS_STALE_TIME_MS,
    retry: 1,
  });
};
