import type { FriendRequestStatus } from "../../../domain/value-objects/friend-request-status.vo";
import type { FriendshipStatus } from "../../../domain/value-objects/friendship-status.vo";

export type MongoIdLike = {
  toString(): string;
};

export type MongoFriendRecord = {
  _id: MongoIdLike;
  userId: MongoIdLike;
  friendId: MongoIdLike;
  status: FriendshipStatus;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type MongoFriendRequestRecord = {
  _id: MongoIdLike;
  senderId: MongoIdLike;
  receiverId: MongoIdLike;
  pairKey: string;
  status: FriendRequestStatus;
  message: string;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type MongoFriendUserRecord = {
  _id: MongoIdLike;
  fullName: string;
  username: string;
  avatarUrl?: string | null;
  level: number;
};

export type MongoFriendListAggregateRecord = {
  friendCreatedAt: Date;
  user: MongoFriendUserRecord;
};

export type MongoSearchFacetRecord = {
  items: MongoFriendUserRecord[];
  metadata: Array<{
    count: number;
  }>;
};

export type MongoFriendListFacetRecord = {
  items: MongoFriendListAggregateRecord[];
  metadata: Array<{
    count: number;
  }>;
};

export type MongoRequestAggregateRecord = {
  request: MongoFriendRequestRecord;
  user: MongoFriendUserRecord;
};

export type MongoRequestFacetRecord = {
  items: MongoRequestAggregateRecord[];
  metadata: Array<{
    count: number;
  }>;
};

export type MongoRelationshipRecord = {
  userId: MongoIdLike;
  friendId: MongoIdLike;
};

export type MongoPendingRequestRelationshipRecord = {
  senderId: MongoIdLike;
  receiverId: MongoIdLike;
  pairKey: string;
};

export type MongoDuplicateKeyError = {
  code: 11000;
  keyPattern?: Record<string, unknown>;
  keyValue?: Record<string, unknown>;
};

export type MongooseObjectLike<T> = {
  toObject(): T;
};
