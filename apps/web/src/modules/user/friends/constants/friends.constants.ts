import type { FriendsTab } from '../types/friends.types';

export const FRIENDS_ENDPOINTS = {
  root: '/friends',
  search: '/friends/search',
  requests: '/friends/requests',
  acceptRequest: (requestId: string) => `/friends/requests/${requestId}/accept`,
  declineRequest: (requestId: string) => `/friends/requests/${requestId}/decline`,
  cancelRequest: (requestId: string) => `/friends/requests/${requestId}/cancel`,
  removeFriend: (friendUserId: string) => `/friends/${friendUserId}`,
} as const;

export const FRIENDS_QUERY_ROOT = 'friends';
export const FRIENDS_DEFAULT_PAGE_SIZE = 20;
export const FRIENDS_SEARCH_MIN_LENGTH = 2;
export const FRIENDS_SEARCH_MAX_LENGTH = 80;
export const FRIENDS_STALE_TIME_MS = 30_000;
export const FRIENDS_SEARCH_DEBOUNCE_MS = 300;

export const FRIENDS_TABS: ReadonlyArray<{
  value: FriendsTab;
  label: string;
}> = [
  { value: 'friends', label: 'My Friends' },
  { value: 'requests', label: 'Friend Invites' },
];
