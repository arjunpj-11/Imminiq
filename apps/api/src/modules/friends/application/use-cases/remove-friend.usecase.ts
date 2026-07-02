import type { FriendCommandRepositoryContract } from "../../domain/repositories/friend-command.repository.interface";
import type {
  FriendActionView,
  RemoveFriendPayload,
} from "../dtos/friends.dto";
import { FriendsApplicationError } from "../errors/friends-application.error";
import type { FriendRelationshipPolicyContract } from "../policies/friend-relationship.policy";

export class RemoveFriendUseCase {
  constructor(
    private readonly _friendCommandRepository: FriendCommandRepositoryContract,
    private readonly _friendRelationshipPolicy: FriendRelationshipPolicyContract,
  ) {}

  async execute(
    userId: string,
    payload: RemoveFriendPayload,
  ): Promise<FriendActionView> {
    this._friendRelationshipPolicy.ensureDifferentUsers(
      userId,
      payload.friendUserId,
    );

    const result = await this._friendCommandRepository.removeFriend({
      userId,
      friendUserId: payload.friendUserId,
    });

    if (result.outcome === "not_friends") {
      throw FriendsApplicationError.friendshipNotFound();
    }

    return { success: true };
  }
}
