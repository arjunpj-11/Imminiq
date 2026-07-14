export type FriendsTab = 'friends' | 'requests';

export type FriendRelationshipStatus = 'none' | 'pending' | 'friends';

export type FriendRequestDirection = 'received' | 'sent';

export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface IFriendRelationship {
  status: FriendRelationshipStatus;
  direction?: FriendRequestDirection;
}

export interface IFriendUser {
  id: string;
  fullName: string;
  username: string;
  handle: string;
  initials: string;
  avatarUrl?: string | null;
  level: number;
  levelLabel: string;
  mutualCount: number;
  relationship: IFriendRelationship;
}

export interface IFriendsPagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface IFriendUsersPage {
  items: IFriendUser[];
  pagination: IFriendsPagination;
}

export interface IFriendRequest {
  id: string;
  direction: FriendRequestDirection;
  status: FriendRequestStatus;
  message: string;
  createdAt: string;
  updatedAt: string;
  user: IFriendUser;
}

export interface IFriendRequestListPage {
  items: IFriendRequest[];
  pagination: IFriendsPagination;
}

export interface IFriendRequestsResponse {
  received: IFriendRequestListPage;
  sent: IFriendRequestListPage;
  pendingReceivedCount: number;
}

export interface ISendFriendRequestResponse {
  created: boolean;
  request: {
    id: string;
    receiverUserId: string;
    status: 'pending';
    message: string;
    createdAt: string;
  };
}

export interface IAcceptFriendRequestResponse {
  alreadyAccepted: boolean;
  friend: IFriendUser;
}

export interface IFriendActionResponse {
  success: true;
}

export interface IFriendsApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface IFriendsApiErrorResponse {
  success?: boolean;
  message?: string;
  code?: string;
}

export interface IFriendsListQueryInput {
  search?: string;
  limit: number;
}

export interface IFriendSearchQueryInput {
  query: string;
  limit: number;
}

export interface IFriendRequestsQueryInput {
  limit: number;
}

export interface ISendFriendRequestInput {
  receiverUserId: string;
  message?: string;
}

export interface IFriendRequestActionInput {
  requestId: string;
}

export interface IRemoveFriendInput {
  friendUserId: string;
}
