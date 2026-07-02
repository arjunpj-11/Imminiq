export type FriendsTab = "friends" | "requests";

export type FriendRelationshipStatus = "none" | "pending" | "friends";

export type FriendRequestDirection = "received" | "sent";

export type FriendRequestStatus =
  "pending" | "accepted" | "rejected" | "cancelled";

export interface FriendRelationship {
  status: FriendRelationshipStatus;
  direction?: FriendRequestDirection;
}

export interface FriendUser {
  id: string;
  fullName: string;
  username: string;
  handle: string;
  initials: string;
  avatarUrl?: string | null;
  level: number;
  levelLabel: string;
  mutualCount: number;
  relationship: FriendRelationship;
}

export interface FriendsPagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface FriendUsersPage {
  items: FriendUser[];
  pagination: FriendsPagination;
}

export interface FriendRequest {
  id: string;
  direction: FriendRequestDirection;
  status: FriendRequestStatus;
  message: string;
  createdAt: string;
  updatedAt: string;
  user: FriendUser;
}

export interface FriendRequestListPage {
  items: FriendRequest[];
  pagination: FriendsPagination;
}

export interface FriendRequestsResponse {
  received: FriendRequestListPage;
  sent: FriendRequestListPage;
  pendingReceivedCount: number;
}

export interface SendFriendRequestResponse {
  created: boolean;
  request: {
    id: string;
    receiverUserId: string;
    status: "pending";
    message: string;
    createdAt: string;
  };
}

export interface AcceptFriendRequestResponse {
  alreadyAccepted: boolean;
  friend: FriendUser;
}

export interface FriendActionResponse {
  success: true;
}

export interface FriendsApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface FriendsApiErrorResponse {
  success?: boolean;
  message?: string;
  code?: string;
}

export interface FriendsListQueryInput {
  search?: string;
  limit: number;
}

export interface FriendSearchQueryInput {
  query: string;
  limit: number;
}

export interface FriendRequestsQueryInput {
  limit: number;
}

export interface SendFriendRequestInput {
  receiverUserId: string;
  message?: string;
}

export interface FriendRequestActionInput {
  requestId: string;
}

export interface RemoveFriendInput {
  friendUserId: string;
}
