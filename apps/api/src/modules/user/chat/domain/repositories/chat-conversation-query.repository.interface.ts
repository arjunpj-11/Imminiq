import type { ChatConversationEntity } from '../entities/chat-conversation.entity';
import type {
  ListChatConversationsInput,
  PaginatedChatResult,
} from '../chat.types';

export interface IChatConversationQueryRepository {
  listConversations(
    input: ListChatConversationsInput
  ): Promise<PaginatedChatResult<ChatConversationEntity>>;

  findConversationForParticipant(
    conversationId: string,
    participantUserId: string
  ): Promise<ChatConversationEntity | null>;
}
