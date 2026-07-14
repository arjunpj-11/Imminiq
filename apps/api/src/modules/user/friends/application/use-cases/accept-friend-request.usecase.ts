import type { IFriendCommandRepository } from '../../domain/repositories/friend-command.repository.interface';
import type { IFriendQueryRepository } from '../../domain/repositories/friend-query.repository.interface';
import type { AcceptFriendRequestViewDTO, FriendRequestActionPayloadDTO } from '../friends.dto';
import { FriendsApplicationError } from '../friends-application.error';
import type { IFriendsMapper } from '../friends.mapper';

export interface IAcceptFriendRequestUseCase {
  execute(
    receiverUserId: string,
    payload: FriendRequestActionPayloadDTO
  ): Promise<AcceptFriendRequestViewDTO>;
}

export class AcceptFriendRequestUseCase implements IAcceptFriendRequestUseCase {
  constructor(
    private readonly _friendCommandRepository: IFriendCommandRepository,
    private readonly _friendQueryRepository: IFriendQueryRepository,
    private readonly _friendsMapper: IFriendsMapper
  ) {}

  async execute(
    receiverUserId: string,
    payload: FriendRequestActionPayloadDTO
  ): Promise<AcceptFriendRequestViewDTO> {
    const result = await this._friendCommandRepository.acceptFriendRequest({
      requestId: payload.requestId,
      actorUserId: receiverUserId,
    });

    switch (result.outcome) {
      case 'not_found':
        throw FriendsApplicationError.requestNotFound();

      case 'forbidden':
        throw FriendsApplicationError.requestForbidden();

      case 'not_pending':
        throw FriendsApplicationError.requestNotPending();

      case 'target_unavailable':
        throw FriendsApplicationError.userNotFound();

      case 'accepted':
      case 'already_accepted':
        break;
    }

    const friend = await this._friendQueryRepository.findFriendUser(
      receiverUserId,
      result.friendUserId
    );

    if (!friend) {
      throw FriendsApplicationError.operationFailed();
    }

    return {
      alreadyAccepted: result.outcome === 'already_accepted',
      friend: this._friendsMapper.toFriendUserView(friend),
    };
  }
}
