import type { ChatMessageEntity } from '../entities/chat-message.entity';
import type { CreateChatMessageCommandInput } from '../chat.types';

export interface IChatMessageCommandRepository {
  createMessage(input: CreateChatMessageCommandInput): Promise<ChatMessageEntity>;
  markConversationRead(conversationId: string, viewerUserId: string): Promise<number>;
  toggleMessageStar(messageId: string, viewerUserId: string): Promise<ChatMessageEntity | null>;
  toggleMessageReaction(
    messageId: string,
    viewerUserId: string,
    emoji: string
  ): Promise<ChatMessageEntity | null>;
  editMessageText(
    messageId: string,
    viewerUserId: string,
    text: string
  ): Promise<ChatMessageEntity | null>;
  deleteMessage(messageId: string, viewerUserId: string): Promise<boolean>;
  clearConversationMessages(conversationId: string, viewerUserId: string): Promise<number>;
}
