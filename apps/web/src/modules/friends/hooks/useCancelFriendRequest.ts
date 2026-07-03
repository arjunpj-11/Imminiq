import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import api from "../../../lib/axios";
import { FRIENDS_ENDPOINTS } from "../constants/friends.constants";
import type {
  FriendActionResponse,
  FriendRequestActionInput,
  FriendsApiErrorResponse,
  FriendsApiResponse,
} from "../types/friends.types";
import { friendsQueryKeys } from "./friends-query-keys";

export const useCancelFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<
    FriendActionResponse,
    AxiosError<FriendsApiErrorResponse>,
    FriendRequestActionInput
  >({
    mutationFn: async ({ requestId }) => {
      const response = await api.patch<
        FriendsApiResponse<FriendActionResponse>
      >(FRIENDS_ENDPOINTS.cancelRequest(requestId));

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
