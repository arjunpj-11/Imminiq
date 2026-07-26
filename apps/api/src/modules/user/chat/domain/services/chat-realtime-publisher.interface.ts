import type { ChatMessageEntity } from '../entities/chat-message.entity';
import type { ChatBlockStateEvent, ChatConversationReadEvent } from '../chat.types';

export interface IChatRealtimePublisher {
  messageCreated(userIds: string[], message: ChatMessageEntity): void;
  conversationRead(userIds: string[], event: ChatConversationReadEvent): void;
  blockStateChanged(userIds: string[], event: ChatBlockStateEvent): void;
}
