import type { ChatMessageEntity } from '../entities/chat-message.entity';
import type { CreateChatMessageCommandInput } from '../chat.types';

export interface IChatMessageCommandRepository {
  createMessage(input: CreateChatMessageCommandInput): Promise<ChatMessageEntity>;
  markConversationRead(conversationId: string, viewerUserId: string): Promise<number>;
}
