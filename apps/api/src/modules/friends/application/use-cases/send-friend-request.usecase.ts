import { FriendsDomainError } from "../../domain/errors/friends-domain.error";
import type { FriendCommandRepositoryContract } from "../../domain/repositories/friend-command.repository.interface";
import type {
  SendFriendRequestPayload,
  SendFriendRequestView,
} from "../dtos/friends.dto";
import { FriendsApplicationError } from "../errors/friends-application.error";
import type { FriendsMapperContract } from "../mappers/friends.mapper";
import type { FriendRelationshipPolicyContract } from "../policies/friend-relationship.policy";

export class SendFriendRequestUseCase {
  constructor(
    private readonly _friendCommandRepository: FriendCommandRepositoryContract,
    private readonly _friendRelationshipPolicy: FriendRelationshipPolicyContract,
    private readonly _friendsMapper: FriendsMapperContract,
  ) {}

  async execute(
    senderUserId: string,
    payload: SendFriendRequestPayload,
  ): Promise<SendFriendRequestView> {
    this._friendRelationshipPolicy.ensureDifferentUsers(
      senderUserId,
      payload.receiverUserId,
    );

    try {
      const result = await this._friendCommandRepository.sendFriendRequest({
        senderUserId,
        receiverUserId: payload.receiverUserId,
        message: payload.message?.trim() ?? "",
      });

      switch (result.outcome) {
        case "created":
          return {
            created: true,
            request: this._friendsMapper.toRequestActionView(result.request),
          };

        case "already_pending":
          return {
            created: false,
            request: this._friendsMapper.toRequestActionView(result.request),
          };

        case "already_friends":
          throw FriendsApplicationError.alreadyFriends();

        case "reverse_pending":
          throw FriendsApplicationError.reverseRequestExists();

        case "target_unavailable":
          throw FriendsApplicationError.userNotFound();
      }
    } catch (error) {
      if (
        error instanceof FriendsDomainError &&
        error.code === "FRIEND_REQUEST_CONFLICT"
      ) {
        throw FriendsApplicationError.requestAlreadyPending();
      }

      throw error;
    }
  }
}
