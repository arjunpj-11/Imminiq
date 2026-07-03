import type {
  FriendRequestActionPayload,
  ListFriendRequestsPayload,
  ListFriendsPayload,
  RemoveFriendPayload,
  SearchUsersPayload,
  SendFriendRequestPayload,
} from "./application/dtos/friends.dto";
import {
  createFriendsComposition,
  type FriendsComposition,
} from "./friends.factory";

export class FriendsService {
  private readonly _useCases: FriendsComposition["useCases"];

  constructor(composition: FriendsComposition) {
    this._useCases = composition.useCases;
  }

  searchUsers(viewerUserId: string, payload: SearchUsersPayload) {
    return this._useCases.searchUsers.execute(viewerUserId, payload);
  }

  listFriends(viewerUserId: string, payload: ListFriendsPayload) {
    return this._useCases.listFriends.execute(viewerUserId, payload);
  }

  listFriendRequests(viewerUserId: string, payload: ListFriendRequestsPayload) {
    return this._useCases.listFriendRequests.execute(viewerUserId, payload);
  }

  sendFriendRequest(senderUserId: string, payload: SendFriendRequestPayload) {
    return this._useCases.sendFriendRequest.execute(senderUserId, payload);
  }

  acceptFriendRequest(
    receiverUserId: string,
    payload: FriendRequestActionPayload,
  ) {
    return this._useCases.acceptFriendRequest.execute(receiverUserId, payload);
  }

  declineFriendRequest(
    receiverUserId: string,
    payload: FriendRequestActionPayload,
  ) {
    return this._useCases.declineFriendRequest.execute(receiverUserId, payload);
  }

  cancelFriendRequest(
    senderUserId: string,
    payload: FriendRequestActionPayload,
  ) {
    return this._useCases.cancelFriendRequest.execute(senderUserId, payload);
  }

  removeFriend(userId: string, payload: RemoveFriendPayload) {
    return this._useCases.removeFriend.execute(userId, payload);
  }
}

export const friendsService = new FriendsService(createFriendsComposition());
