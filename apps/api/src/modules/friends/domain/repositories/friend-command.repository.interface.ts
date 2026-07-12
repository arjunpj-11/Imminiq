import type {
  AcceptFriendRequestCommandResult,
  ChangeFriendRequestCommandResult,
  FriendRequestActionCommandInput,
  RemoveFriendCommandInput,
  RemoveFriendCommandResult,
  SendFriendRequestCommandInput,
  SendFriendRequestCommandResult,
} from "../friends.types";

export interface IFriendCommandRepository {
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
