import type { FriendRequestEntity } from "../../domain/entities/friend-request.entity";
import type { FriendRequestSummaryEntity } from "../../domain/entities/friend-request-summary.entity";
import type { FriendUserEntity } from "../../domain/entities/friend-user.entity";
import type {
  FriendRequestView,
  FriendRelationshipView,
  FriendUserView,
  FriendUsersPageView,
  PaginationView,
} from "../dtos/friends.dto";
import type { PaginatedResult } from "../../domain/types/friends.types";

export interface FriendsMapperContract {
  toFriendUserView(user: FriendUserEntity): FriendUserView;
  toFriendRequestView(summary: FriendRequestSummaryEntity): FriendRequestView;
  toFriendUsersPageView(
    page: PaginatedResult<FriendUserEntity>,
  ): FriendUsersPageView;
  toPaginationView<T>(page: PaginatedResult<T>): PaginationView;
  toRequestActionView(request: FriendRequestEntity): {
    id: string;
    receiverUserId: string;
    status: "pending";
    message: string;
    createdAt: Date;
  };
}

export class FriendsMapper implements FriendsMapperContract {
  toFriendUserView(user: FriendUserEntity): FriendUserView {
    return {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      handle: user.username.startsWith("@")
        ? user.username
        : `@${user.username}`,
      initials: this.getInitials(user.fullName || user.username),
      ...(user.avatarUrl !== undefined ? { avatarUrl: user.avatarUrl } : {}),
      level: user.level,
      levelLabel: `Level ${Math.max(1, user.level)}`,
      mutualCount: user.mutualCount,
      relationship: this.toRelationshipView(user.relationshipStatus),
    };
  }

  toFriendRequestView(summary: FriendRequestSummaryEntity): FriendRequestView {
    return {
      id: summary.request.id,
      direction: summary.direction,
      status: summary.request.status,
      message: summary.request.message,
      createdAt: summary.request.createdAt,
      updatedAt: summary.request.updatedAt,
      user: this.toFriendUserView(summary.user),
    };
  }

  toFriendUsersPageView(
    page: PaginatedResult<FriendUserEntity>,
  ): FriendUsersPageView {
    return {
      items: page.items.map((item) => this.toFriendUserView(item)),
      pagination: this.toPaginationView(page),
    };
  }

  toPaginationView<T>(page: PaginatedResult<T>): PaginationView {
    return {
      page: page.page,
      limit: page.limit,
      total: page.total,
      hasMore: page.hasMore,
    };
  }

  toRequestActionView(request: FriendRequestEntity) {
    return {
      id: request.id,
      receiverUserId: request.receiverId,
      status: "pending" as const,
      message: request.message,
      createdAt: request.createdAt,
    };
  }

  private toRelationshipView(
    status: FriendUserEntity["relationshipStatus"],
  ): FriendRelationshipView {
    if (status === "friends") {
      return { status: "friends" };
    }

    if (status === "pending_sent") {
      return {
        status: "pending",
        direction: "sent",
      };
    }

    if (status === "pending_received") {
      return {
        status: "pending",
        direction: "received",
      };
    }

    return { status: "none" };
  }

  private getInitials(value: string): string {
    const initials = value
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");

    return initials || "IU";
  }
}
