import type { IChatBlockRepository } from '../domain/repositories/chat-block.repository.interface';
import type { UserBlocksViewDTO } from './chat.dto';

type ChatBlockReadRepository = Pick<
  IChatBlockRepository,
  'listBlockedUserIds' | 'listBlockedByUserIds'
>;

export const getChatBlocksView = async (
  blocks: ChatBlockReadRepository,
  viewerUserId: string
): Promise<UserBlocksViewDTO> => {
  const [blockedUserIds, blockedByUserIds] = await Promise.all([
    blocks.listBlockedUserIds(viewerUserId),
    blocks.listBlockedByUserIds(viewerUserId),
  ]);
  return { blockedUserIds, blockedByUserIds };
};
