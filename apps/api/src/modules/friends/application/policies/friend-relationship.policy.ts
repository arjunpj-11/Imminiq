import { FriendsApplicationError } from "../errors/friends-application.error";

export interface FriendRelationshipPolicyContract {
  ensureDifferentUsers(actorUserId: string, targetUserId: string): void;
}

export class FriendRelationshipPolicy implements FriendRelationshipPolicyContract {
  ensureDifferentUsers(actorUserId: string, targetUserId: string): void {
    if (actorUserId === targetUserId) {
      throw FriendsApplicationError.cannotFriendSelf();
    }
  }
}
