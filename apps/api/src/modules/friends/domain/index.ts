export * from "./constants/friends.constants";

export * from "./entities/friend.entity";
export * from "./entities/friend-request.entity";
export * from "./entities/friend-request-summary.entity";
export * from "./entities/friend-user.entity";

export * from "./errors/friends-domain.error";

export type { FriendCommandRepositoryContract } from "./repositories/friend-command.repository.interface";
export type { FriendQueryRepositoryContract } from "./repositories/friend-query.repository.interface";
export type { FriendRequestRepositoryContract } from "./repositories/friend-request.repository.interface";
export type { FriendsRepositoryContract } from "./repositories/friends.repository.interface";

export * from "./types/friends.types";

export type { FriendRelationshipStatus } from "./value-objects/friend-relationship-status.vo";
export type { FriendRequestStatus } from "./value-objects/friend-request-status.vo";
export type { FriendshipStatus } from "./value-objects/friendship-status.vo";
