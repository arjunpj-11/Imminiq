import type {
  FriendRequestsPage,
  ListFriendRequestsInput,
} from "../types/friends.types";

export interface IFriendRequestRepository {
  listReceivedRequests(
    input: ListFriendRequestsInput,
  ): Promise<FriendRequestsPage>;

  listSentRequests(input: ListFriendRequestsInput): Promise<FriendRequestsPage>;
}
