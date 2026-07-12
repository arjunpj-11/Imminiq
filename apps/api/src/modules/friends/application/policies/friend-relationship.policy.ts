import { FriendsApplicationError } from "../errors/friends-application.error";

export interface IFriendRelationshipPolicy {
  ensureDifferentUsers(actorUserId: string, targetUserId: string): void;
}

export class FriendRelationshipPolicy implements IFriendRelationshipPolicy {
  ensureDifferentUsers(actorUserId: string, targetUserId: string): void {
    if (actorUserId === targetUserId) {
      throw FriendsApplicationError.cannotFriendSelf();
    }
  }
}
