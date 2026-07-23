import type { IChatBlockRepository } from '../../domain/repositories/chat-block.repository.interface';
import type { UserBlocksViewDTO } from '../chat.dto';
import { getChatBlocksView } from '../chat-blocks-view';

export interface IListBlockedUsersUseCase {
  execute(viewerUserId: string): Promise<UserBlocksViewDTO>;
}

export class ListBlockedUsersUseCase implements IListBlockedUsersUseCase {
  constructor(
    private readonly _blocks: Pick<
      IChatBlockRepository,
      'listBlockedUserIds' | 'listBlockedByUserIds'
    >
  ) {}

  async execute(viewerUserId: string) {
    return getChatBlocksView(this._blocks, viewerUserId);
  }
}
