import type { IFriendCommandRepository } from "../../domain/repositories/friend-command.repository.interface";
import type {
  FriendActionViewDTO,
  RemoveFriendPayloadDTO,
} from "../dtos/friends.dto";
import { FriendsApplicationError } from "../errors/friends-application.error";
import type { IFriendRelationshipPolicy } from "../policies/friend-relationship.policy";

export interface IRemoveFriendUseCase {
  execute(userId: string, payload: RemoveFriendPayloadDTO): Promise<FriendActionViewDTO>
}

export class RemoveFriendUseCase implements IRemoveFriendUseCase {
  constructor(
    private readonly _friendCommandRepository: IFriendCommandRepository,
    private readonly _friendRelationshipPolicy: IFriendRelationshipPolicy,
  ) {}

  async execute(
    userId: string,
    payload: RemoveFriendPayloadDTO,
  ): Promise<FriendActionViewDTO> {
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
