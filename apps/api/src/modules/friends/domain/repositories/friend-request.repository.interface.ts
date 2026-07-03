import type {
  FriendRequestsPage,
  ListFriendRequestsInput,
} from "../types/friends.types";

export interface FriendRequestRepositoryContract {
  listReceivedRequests(
    input: ListFriendRequestsInput,
  ): Promise<FriendRequestsPage>;

  listSentRequests(input: ListFriendRequestsInput): Promise<FriendRequestsPage>;
}
