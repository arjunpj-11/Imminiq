import type { IChatBlockRepository } from '../../domain/repositories/chat-block.repository.interface';
import type { UserBlockInputDTO, UserBlocksViewDTO } from '../chat.dto';
import { getChatBlocksView } from '../chat-blocks-view';
import type { IChatRealtimePublisher } from '../../domain/services/chat-realtime-publisher.interface';

export interface IUnblockUserUseCase {
  execute(viewerUserId: string, input: UserBlockInputDTO): Promise<UserBlocksViewDTO>;
}

export class UnblockUserUseCase implements IUnblockUserUseCase {
  constructor(
    private readonly _blocks: Pick<
      IChatBlockRepository,
      'unblockUser' | 'listBlockedUserIds' | 'listBlockedByUserIds'
    >,
    private readonly _realtime: IChatRealtimePublisher
  ) {}

  async execute(viewerUserId: string, input: UserBlockInputDTO) {
    await this._blocks.unblockUser(viewerUserId, input.userId);
    this._realtime.blockStateChanged([viewerUserId, input.userId], {
      blockerUserId: viewerUserId,
      blockedUserId: input.userId,
      isBlocked: false,
    });
    return getChatBlocksView(this._blocks, viewerUserId);
  }
}
