import type { IChatBlockRepository } from '../../domain/repositories/chat-block.repository.interface';
import type { UserBlockInputDTO, UserBlocksViewDTO } from '../chat.dto';
import { ChatApplicationError } from '../chat-application.error';
import { getChatBlocksView } from '../chat-blocks-view';
import type { IChatParticipantPolicy } from '../chat-participant.policy';
import type { IChatRealtimePublisher } from '../../domain/services/chat-realtime-publisher.interface';

export interface IBlockUserUseCase {
  execute(viewerUserId: string, input: UserBlockInputDTO): Promise<UserBlocksViewDTO>;
}

export class BlockUserUseCase implements IBlockUserUseCase {
  constructor(
    private readonly _blocks: Pick<
      IChatBlockRepository,
      'blockUser' | 'listBlockedUserIds' | 'listBlockedByUserIds'
    >,
    private readonly _participantPolicy: IChatParticipantPolicy,
    private readonly _realtime: IChatRealtimePublisher
  ) {}

  async execute(viewerUserId: string, input: UserBlockInputDTO) {
    this._participantPolicy.ensureDifferentUsers(viewerUserId, input.userId);
    try {
      await this._blocks.blockUser(viewerUserId, input.userId);
    } catch {
      throw ChatApplicationError.blockFailed();
    }
    this._realtime.blockStateChanged([viewerUserId, input.userId], {
      blockerUserId: viewerUserId,
      blockedUserId: input.userId,
      isBlocked: true,
    });
    return getChatBlocksView(this._blocks, viewerUserId);
  }
}
