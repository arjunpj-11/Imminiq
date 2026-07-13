import type { FriendRequestEntity } from "./entities/friend-request.entity";
import type { FriendRequestSummaryEntity } from "./entities/friend-request-summary.entity";
import type { FriendUserEntity } from "./entities/friend-user.entity";

export type FriendRelationshipStatus =
  "none" | "pending_sent" | "pending_received" | "friends";
export type FriendRequestStatus =
  "pending" | "accepted" | "rejected" | "cancelled";
export type FriendshipStatus = "active" | "blocked";

export type PaginationInput = {
  page: number;
  limit: number;
};

export type PaginatedResult<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

export type SearchFriendUsersInput = PaginationInput & {
  viewerUserId: string;
  query: string;
};

export type ListFriendsInput = PaginationInput & {
  viewerUserId: string;
  search?: string;
};

export type ListFriendRequestsInput = PaginationInput & {
  viewerUserId: string;
};

export type SendFriendRequestCommandInput = {
  senderUserId: string;
  receiverUserId: string;
  message: string;
};

export type SendFriendRequestCommandResult =
  | {
      outcome: "created";
      request: FriendRequestEntity;
    }
  | {
      outcome: "already_pending";
      request: FriendRequestEntity;
    }
  | {
      outcome: "already_friends";
    }
  | {
      outcome: "reverse_pending";
      request: FriendRequestEntity;
    }
  | {
      outcome: "target_unavailable";
    };

export type FriendRequestActionCommandInput = {
  requestId: string;
  actorUserId: string;
};

export type AcceptFriendRequestCommandResult =
  | {
      outcome: "accepted" | "already_accepted";
      friendUserId: string;
    }
  | {
      outcome: "not_found" | "forbidden" | "not_pending" | "target_unavailable";
    };

export type ChangeFriendRequestCommandResult = {
  outcome:
    "changed" | "already_changed" | "not_found" | "forbidden" | "not_pending";
};

export type RemoveFriendCommandInput = {
  userId: string;
  friendUserId: string;
};

export type RemoveFriendCommandResult = {
  outcome: "removed" | "not_friends";
};

export type FriendUsersPage = PaginatedResult<FriendUserEntity>;
export type FriendRequestsPage = PaginatedResult<FriendRequestSummaryEntity>;
