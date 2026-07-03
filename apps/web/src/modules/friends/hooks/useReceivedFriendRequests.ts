import { useInfiniteQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import api from "../../../lib/axios";
import {
  FRIENDS_ENDPOINTS,
  FRIENDS_STALE_TIME_MS,
} from "../constants/friends.constants";
import type {
  FriendRequestListPage,
  FriendRequestsQueryInput,
  FriendRequestsResponse,
  FriendsApiErrorResponse,
  FriendsApiResponse,
} from "../types/friends.types";
import { friendsQueryKeys } from "./friends-query-keys";

export const useReceivedFriendRequests = (input: FriendRequestsQueryInput) =>
  useInfiniteQuery<
    FriendRequestListPage & { pendingReceivedCount: number },
    AxiosError<FriendsApiErrorResponse>
  >({
    queryKey: friendsQueryKeys.receivedRequests(input),
    queryFn: async ({ pageParam }) => {
      const page = typeof pageParam === "number" ? pageParam : 1;
      const response = await api.get<
        FriendsApiResponse<FriendRequestsResponse>
      >(FRIENDS_ENDPOINTS.requests, {
        params: {
          receivedPage: page,
          sentPage: 1,
          limit: input.limit,
        },
      });

      return {
        ...response.data.data.received,
        pendingReceivedCount: response.data.data.pendingReceivedCount,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    staleTime: FRIENDS_STALE_TIME_MS,
    retry: 1,
  });
