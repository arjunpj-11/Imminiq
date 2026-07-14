import type { IFriendCommandRepository } from '../../domain/repositories/friend-command.repository.interface';
import type { FriendActionViewDTO, FriendRequestActionPayloadDTO } from '../friends.dto';
import { FriendsApplicationError } from '../friends-application.error';

export interface ICancelFriendRequestUseCase {
  execute(
    senderUserId: string,
    payload: FriendRequestActionPayloadDTO
  ): Promise<FriendActionViewDTO>;
}

export class CancelFriendRequestUseCase implements ICancelFriendRequestUseCase {
  constructor(private readonly _friendCommandRepository: IFriendCommandRepository) {}

  async execute(
    senderUserId: string,
    payload: FriendRequestActionPayloadDTO
  ): Promise<FriendActionViewDTO> {
    const result = await this._friendCommandRepository.cancelFriendRequest({
      requestId: payload.requestId,
      actorUserId: senderUserId,
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
