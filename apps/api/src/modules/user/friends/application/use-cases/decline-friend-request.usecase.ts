import type { IFriendCommandRepository } from '../../domain/repositories/friend-command.repository.interface';
import type { FriendActionViewDTO, FriendRequestActionPayloadDTO } from '../friends.dto';
import { FriendsApplicationError } from '../friends-application.error';

export interface IDeclineFriendRequestUseCase {
  execute(
    receiverUserId: string,
    payload: FriendRequestActionPayloadDTO
  ): Promise<FriendActionViewDTO>;
}

export class DeclineFriendRequestUseCase implements IDeclineFriendRequestUseCase {
  constructor(private readonly _friendCommandRepository: IFriendCommandRepository) {}

  async execute(
    receiverUserId: string,
    payload: FriendRequestActionPayloadDTO
  ): Promise<FriendActionViewDTO> {
    const result = await this._friendCommandRepository.declineFriendRequest({
      requestId: payload.requestId,
      actorUserId: receiverUserId,
    });

    if (result.outcome === 'not_found') {
      throw FriendsApplicationError.requestNotFound();
    }

    if (result.outcome === 'forbidden') {
      throw FriendsApplicationError.requestForbidden();
    }

    if (result.outcome === 'not_pending') {
      throw FriendsApplicationError.requestNotPending();
    }

    return { success: true };
  }
}
