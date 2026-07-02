import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import api from "../../../lib/axios";
import { FRIENDS_ENDPOINTS } from "../constants/friends.constants";
import type {
  FriendsApiErrorResponse,
  FriendsApiResponse,
  SendFriendRequestInput,
  SendFriendRequestResponse,
} from "../types/friends.types";
import { friendsQueryKeys } from "./friends-query-keys";

export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<
    SendFriendRequestResponse,
    AxiosError<FriendsApiErrorResponse>,
    SendFriendRequestInput
  >({
    mutationFn: async (input) => {
      const response = await api.post<
        FriendsApiResponse<SendFriendRequestResponse>
      >(FRIENDS_ENDPOINTS.requests, input);

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
