import type { FriendCommandRepositoryContract } from "./friend-command.repository.interface";
import type { FriendQueryRepositoryContract } from "./friend-query.repository.interface";
import type { FriendRequestRepositoryContract } from "./friend-request.repository.interface";

export interface FriendsRepositoryContract
  extends
    FriendQueryRepositoryContract,
    FriendRequestRepositoryContract,
    FriendCommandRepositoryContract {}
