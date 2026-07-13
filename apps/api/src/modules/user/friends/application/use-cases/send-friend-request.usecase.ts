import { FriendsDomainError } from '../../domain/friends-domain.error';
import type { IFriendCommandRepository } from '../../domain/repositories/friend-command.repository.interface';
import type { SendFriendRequestPayloadDTO, SendFriendRequestViewDTO } from '../friends.dto';
import { FriendsApplicationError } from '../friends-application.error';
import type { IFriendsMapper } from '../friends.mapper';
import type { IFriendRelationshipPolicy } from '../friend-relationship.policy';

export interface ISendFriendRequestUseCase {
  execute(
    senderUserId: string,
    payload: SendFriendRequestPayloadDTO
  ): Promise<SendFriendRequestViewDTO>;
}

export class SendFriendRequestUseCase implements ISendFriendRequestUseCase {
  constructor(
    private readonly _friendCommandRepository: IFriendCommandRepository,
    private readonly _friendRelationshipPolicy: IFriendRelationshipPolicy,
    private readonly _friendsMapper: IFriendsMapper
  ) {}

  async execute(
    senderUserId: string,
    payload: SendFriendRequestPayloadDTO
  ): Promise<SendFriendRequestViewDTO> {
    this._friendRelationshipPolicy.ensureDifferentUsers(senderUserId, payload.receiverUserId);

    try {
      const result = await this._friendCommandRepository.sendFriendRequest({
        senderUserId,
        receiverUserId: payload.receiverUserId,
        message: payload.message?.trim() ?? '',
      });

      switch (result.outcome) {
        case 'created':
          return {
            created: true,
            request: this._friendsMapper.toRequestActionView(result.request),
          };

        case 'already_pending':
          return {
            created: false,
            request: this._friendsMapper.toRequestActionView(result.request),
          };

        case 'already_friends':
          throw FriendsApplicationError.alreadyFriends();

        case 'reverse_pending':
          throw FriendsApplicationError.reverseRequestExists();

        case 'target_unavailable':
          throw FriendsApplicationError.userNotFound();
      }
    } catch (error) {
      if (error instanceof FriendsDomainError && error.code === 'FRIEND_REQUEST_CONFLICT') {
        throw FriendsApplicationError.requestAlreadyPending();
      }

      throw error;
    }
  }
}
