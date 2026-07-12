import type { FriendUserEntity } from "../entities/friend-user.entity";
import type {
  FriendUsersPage,
  ListFriendsInput,
  SearchFriendUsersInput,
} from "../types/friends.types";

export interface IFriendQueryRepository {
  searchUsers(input: SearchFriendUsersInput): Promise<FriendUsersPage>;
  listFriends(input: ListFriendsInput): Promise<FriendUsersPage>;
  findFriendUser(
    viewerUserId: string,
    friendUserId: string,
  ): Promise<FriendUserEntity | null>;
}
