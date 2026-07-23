import {
  emitChatConversationRead,
  emitChatBlockStateChanged,
  emitChatMessageCreated,
} from '../../../../../infrastructure/realtime/socket';
import type { ChatMessageEntity } from '../../domain/entities/chat-message.entity';
import type { IChatRealtimePublisher } from '../../domain/services/chat-realtime-publisher.interface';
import type {
  ChatBlockStateEvent,
  ChatConversationReadEvent,
} from '../../domain/chat.types';

export class SocketChatRealtimePublisher implements IChatRealtimePublisher {
  messageCreated(userIds: string[], message: ChatMessageEntity): void {
    emitChatMessageCreated(userIds, {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      kind: message.kind,
      text: message.text,
      codeLanguage: message.codeLanguage,
      attachment: message.attachment
        ? {
            url: message.attachment.url,
            name: message.attachment.name,
            mimeType: message.attachment.mimeType,
            sizeBytes: message.attachment.sizeBytes,
          }
        : null,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      isRead: message.isReadByAnotherParticipant(),
    });
  }

  conversationRead(userIds: string[], event: ChatConversationReadEvent): void {
    emitChatConversationRead(userIds, event);
  }

  blockStateChanged(userIds: string[], event: ChatBlockStateEvent): void {
    emitChatBlockStateChanged(userIds, event);
  }
}

export const socketChatRealtimePublisher = new SocketChatRealtimePublisher();
