import { FRIENDS_QUERY_ROOT } from '../constants/friends.constants';
import type {
  IFriendRequestsQueryInput,
  IFriendSearchQueryInput,
  IFriendsListQueryInput,
} from '../types/friends.types';

export const friendsQueryKeys = {
  all: [FRIENDS_QUERY_ROOT] as const,
  lists: () => [...friendsQueryKeys.all, 'list'] as const,
  list: (input: IFriendsListQueryInput) => [...friendsQueryKeys.lists(), input] as const,
  requests: () => [...friendsQueryKeys.all, 'requests'] as const,
  receivedRequests: (input: IFriendRequestsQueryInput) =>
    [...friendsQueryKeys.requests(), 'received', input] as const,
  sentRequests: (input: IFriendRequestsQueryInput) =>
    [...friendsQueryKeys.requests(), 'sent', input] as const,
  searches: () => [...friendsQueryKeys.all, 'search'] as const,
  search: (input: IFriendSearchQueryInput) => [...friendsQueryKeys.searches(), input] as const,
};
