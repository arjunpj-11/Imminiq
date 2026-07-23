import type { ChatConversationEntity } from '../entities/chat-conversation.entity';

export type FindOrCreateChatConversationResult = {
  conversation: ChatConversationEntity;
  created: boolean;
};

export interface IChatConversationCommandRepository {
  findOrCreateConversation(
    firstUserId: string,
    secondUserId: string
  ): Promise<FindOrCreateChatConversationResult>;
}
