export type FriendsPaginationPayloadDTO = {
  page: number;
  limit: number;
};

export type SearchUsersPayloadDTO = FriendsPaginationPayloadDTO & {
  query: string;
};

export type ListFriendsPayloadDTO = FriendsPaginationPayloadDTO & {
  search?: string;
};

export type ListFriendRequestsPayloadDTO = {
  receivedPage: number;
  sentPage: number;
  limit: number;
};

export type SendFriendRequestPayloadDTO = {
  receiverUserId: string;
  message?: string;
};

export type FriendRequestActionPayloadDTO = {
  requestId: string;
};

export type RemoveFriendPayloadDTO = {
  friendUserId: string;
};

export type FriendRelationshipViewDTO = {
  status: "none" | "pending" | "friends";
  direction?: "sent" | "received";
};

export type FriendUserViewDTO = {
  id: string;
  fullName: string;
  username: string;
  handle: string;
  initials: string;
  avatarUrl?: string | null;
  level: number;
  levelLabel: string;
  mutualCount: number;
  relationship: FriendRelationshipViewDTO;
};

export type PaginationViewDTO = {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

export type FriendUsersPageViewDTO = {
  items: FriendUserViewDTO[];
  pagination: PaginationViewDTO;
};

export type FriendRequestViewDTO = {
  id: string;
  direction: "received" | "sent";
  status: "pending" | "accepted" | "rejected" | "cancelled";
  message: string;
  createdAt: Date;
  updatedAt: Date;
  user: FriendUserViewDTO;
};

export type FriendRequestsPageViewDTO = {
  received: {
    items: FriendRequestViewDTO[];
    pagination: PaginationViewDTO;
  };
  sent: {
    items: FriendRequestViewDTO[];
    pagination: PaginationViewDTO;
  };
  pendingReceivedCount: number;
};

export type SendFriendRequestViewDTO = {
  created: boolean;
  request: {
    id: string;
    receiverUserId: string;
    status: "pending";
    message: string;
    createdAt: Date;
  };
};

export type AcceptFriendRequestViewDTO = {
  alreadyAccepted: boolean;
  friend: FriendUserViewDTO;
};

export type FriendActionViewDTO = {
  success: true;
};
