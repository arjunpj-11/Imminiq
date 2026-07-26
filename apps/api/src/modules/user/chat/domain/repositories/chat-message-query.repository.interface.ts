import type { ChatMessageEntity } from '../entities/chat-message.entity';
import type { ListChatMessagesInput, PaginatedChatResult } from '../chat.types';

export interface IChatMessageQueryRepository {
  listMessages(input: ListChatMessagesInput): Promise<PaginatedChatResult<ChatMessageEntity>>;
  findMessagesByIds(messageIds: string[]): Promise<ChatMessageEntity[]>;
  findLatestVisibleMessages(
    conversationIds: string[],
    viewerUserId: string
  ): Promise<ChatMessageEntity[]>;
  findUnreadCounts(conversationIds: string[], viewerUserId: string): Promise<Map<string, number>>;
}
