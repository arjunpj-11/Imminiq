import type { FriendCommandRepositoryContract } from "../../domain/repositories/friend-command.repository.interface";
import type {
  FriendActionView,
  FriendRequestActionPayload,
} from "../dtos/friends.dto";
import { FriendsApplicationError } from "../errors/friends-application.error";

export class CancelFriendRequestUseCase {
  constructor(
    private readonly _friendCommandRepository: FriendCommandRepositoryContract,
  ) {}

  async execute(
    senderUserId: string,
    payload: FriendRequestActionPayload,
  ): Promise<FriendActionView> {
    const result = await this._friendCommandRepository.cancelFriendRequest({
      requestId: payload.requestId,
      actorUserId: senderUserId,
    });

    if (result.outcome === "not_found") {
      throw FriendsApplicationError.requestNotFound();
    }

    if (result.outcome === "forbidden") {
      throw FriendsApplicationError.requestForbidden();
    }

    if (result.outcome === "not_pending") {
      throw FriendsApplicationError.requestNotPending();
    }

    return { success: true };
  }
}
