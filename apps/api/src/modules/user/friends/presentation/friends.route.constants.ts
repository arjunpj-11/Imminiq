export const FRIENDS_ROUTE_PATHS = {
  ROOT: '/',
  SEARCH: '/search',
  REQUESTS: '/requests',
  ACCEPT_REQUEST: '/requests/:requestId/accept',
  DECLINE_REQUEST: '/requests/:requestId/decline',
  CANCEL_REQUEST: '/requests/:requestId/cancel',
  BY_FRIEND_USER_ID: '/:friendUserId',
} as const;

export type FriendsRoutePath = (typeof FRIENDS_ROUTE_PATHS)[keyof typeof FRIENDS_ROUTE_PATHS];
