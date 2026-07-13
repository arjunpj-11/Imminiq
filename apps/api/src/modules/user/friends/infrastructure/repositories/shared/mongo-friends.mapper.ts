import { FriendEntity } from "../../../domain/entities/friend.entity";
import { FriendRequestEntity } from "../../../domain/entities/friend-request.entity";
import {
  FriendRequestSummaryEntity,
  type FriendRequestDirection,
} from "../../../domain/entities/friend-request-summary.entity";
import { FriendUserEntity } from "../../../domain/entities/friend-user.entity";
import { FriendsDomainError } from "../../../domain/friends-domain.error";
import type { FriendRelationshipStatus } from "../../../domain/friends.types";
import type {
  MongoFriendRecord,
  MongoFriendRequestRecord,
  MongoFriendUserRecord,
  MongoIdLike,
  MongooseObjectLike,
} from "./mongo-friends.types";

export class MongoFriendsMapper {
  toId(value: MongoIdLike | string): string {
    return typeof value === "string" ? value : value.toString();
  }

  toPlainRecord<T>(document: MongooseObjectLike<T>): T {
    return document.toObject();
  }

  toFriendEntity(record: MongoFriendRecord | null): FriendEntity | null {
    if (!record) {
      return null;
    }

    return new FriendEntity({
      id: this.toId(record._id),
      userId: this.toId(record.userId),
      friendId: this.toId(record.friendId),
      status: record.status,
      ...(record.deletedAt !== undefined
        ? { deletedAt: record.deletedAt }
        : {}),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toFriendRequestEntity(
    record: MongoFriendRequestRecord | null,
  ): FriendRequestEntity | null {
    if (!record) {
      return null;
    }

    return new FriendRequestEntity({
      id: this.toId(record._id),
      senderId: this.toId(record.senderId),
      receiverId: this.toId(record.receiverId),
      pairKey: record.pairKey,
      status: record.status,
      message: record.message,
      ...(record.deletedAt !== undefined
        ? { deletedAt: record.deletedAt }
        : {}),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toFriendRequestEntityOrThrow(
    record: MongoFriendRequestRecord | null,
  ): FriendRequestEntity {
    const entity = this.toFriendRequestEntity(record);

    if (!entity) {
      throw new FriendsDomainError(
        "FRIEND_REQUEST_MAPPING_FAILED",
        "Failed to map friend request",
      );
    }

    return entity;
  }

  toFriendUserEntity(
    record: MongoFriendUserRecord,
    mutualCount: number,
    relationshipStatus: FriendRelationshipStatus,
  ): FriendUserEntity {
    return new FriendUserEntity({
      id: this.toId(record._id),
      fullName: record.fullName,
      username: record.username,
      ...(record.avatarUrl !== undefined
        ? { avatarUrl: record.avatarUrl }
        : {}),
      level: Math.max(1, record.level ?? 1),
      mutualCount: Math.max(0, mutualCount),
      relationshipStatus,
    });
  }

  toFriendRequestSummaryEntity(
    request: MongoFriendRequestRecord,
    user: MongoFriendUserRecord,
    mutualCount: number,
    direction: FriendRequestDirection,
  ): FriendRequestSummaryEntity {
    const relationshipStatus =
      direction === "received" ? "pending_received" : "pending_sent";

    return new FriendRequestSummaryEntity({
      request: this.toFriendRequestEntityOrThrow(request),
      user: this.toFriendUserEntity(user, mutualCount, relationshipStatus),
      direction,
    });
  }
}
