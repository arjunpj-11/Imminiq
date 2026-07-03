import { FRIENDS_QUERY_ROOT } from "../constants/friends.constants";
import type {
  FriendRequestsQueryInput,
  FriendSearchQueryInput,
  FriendsListQueryInput,
} from "../types/friends.types";

export const friendsQueryKeys = {
  all: [FRIENDS_QUERY_ROOT] as const,
  lists: () => [...friendsQueryKeys.all, "list"] as const,
  list: (input: FriendsListQueryInput) =>
    [...friendsQueryKeys.lists(), input] as const,
  requests: () => [...friendsQueryKeys.all, "requests"] as const,
  receivedRequests: (input: FriendRequestsQueryInput) =>
    [...friendsQueryKeys.requests(), "received", input] as const,
  sentRequests: (input: FriendRequestsQueryInput) =>
    [...friendsQueryKeys.requests(), "sent", input] as const,
  searches: () => [...friendsQueryKeys.all, "search"] as const,
  search: (input: FriendSearchQueryInput) =>
    [...friendsQueryKeys.searches(), input] as const,
};
