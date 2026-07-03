export type FriendsPaginationPayload = {
  page: number;
  limit: number;
};

export type SearchUsersPayload = FriendsPaginationPayload & {
  query: string;
};

export type ListFriendsPayload = FriendsPaginationPayload & {
  search?: string;
};

export type ListFriendRequestsPayload = {
  receivedPage: number;
  sentPage: number;
  limit: number;
};

export type SendFriendRequestPayload = {
  receiverUserId: string;
  message?: string;
};

export type FriendRequestActionPayload = {
  requestId: string;
};

export type RemoveFriendPayload = {
  friendUserId: string;
};

export type FriendRelationshipView = {
  status: "none" | "pending" | "friends";
  direction?: "sent" | "received";
};

export type FriendUserView = {
  id: string;
  fullName: string;
  username: string;
  handle: string;
  initials: string;
  avatarUrl?: string | null;
  level: number;
  levelLabel: string;
  mutualCount: number;
  relationship: FriendRelationshipView;
};

export type PaginationView = {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

export type FriendUsersPageView = {
  items: FriendUserView[];
  pagination: PaginationView;
};

export type FriendRequestView = {
  id: string;
  direction: "received" | "sent";
  status: "pending" | "accepted" | "rejected" | "cancelled";
  message: string;
  createdAt: Date;
  updatedAt: Date;
  user: FriendUserView;
};

export type FriendRequestsPageView = {
  received: {
    items: FriendRequestView[];
    pagination: PaginationView;
  };
  sent: {
    items: FriendRequestView[];
    pagination: PaginationView;
  };
  pendingReceivedCount: number;
};

export type SendFriendRequestView = {
  created: boolean;
  request: {
    id: string;
    receiverUserId: string;
    status: "pending";
    message: string;
    createdAt: Date;
  };
};

export type AcceptFriendRequestView = {
  alreadyAccepted: boolean;
  friend: FriendUserView;
};

export type FriendActionView = {
  success: true;
};
