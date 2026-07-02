import type {
  AcceptFriendRequestCommandResult,
  ChangeFriendRequestCommandResult,
  FriendRequestActionCommandInput,
  RemoveFriendCommandInput,
  RemoveFriendCommandResult,
  SendFriendRequestCommandInput,
  SendFriendRequestCommandResult,
} from "../types/friends.types";

export interface FriendCommandRepositoryContract {
  sendFriendRequest(
    input: SendFriendRequestCommandInput,
  ): Promise<SendFriendRequestCommandResult>;

  acceptFriendRequest(
    input: FriendRequestActionCommandInput,
  ): Promise<AcceptFriendRequestCommandResult>;

  declineFriendRequest(
    input: FriendRequestActionCommandInput,
  ): Promise<ChangeFriendRequestCommandResult>;

  cancelFriendRequest(
    input: FriendRequestActionCommandInput,
  ): Promise<ChangeFriendRequestCommandResult>;

  removeFriend(
    input: RemoveFriendCommandInput,
  ): Promise<RemoveFriendCommandResult>;
}
