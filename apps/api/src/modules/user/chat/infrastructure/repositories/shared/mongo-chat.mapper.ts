import { ChatConversationEntity } from '../../../domain/entities/chat-conversation.entity';
import { ChatMessageEntity } from '../../../domain/entities/chat-message.entity';
import { ChatParticipantEntity } from '../../../domain/entities/chat-participant.entity';
import type {
  MongoChatConversationRecord,
  MongoChatMessageRecord,
  MongoChatParticipantRecord,
} from './mongo-chat.types';

export class MongoChatMapper {
  toConversationEntity(record: MongoChatConversationRecord): ChatConversationEntity {
    return new ChatConversationEntity({
      id: record._id.toString(),
      participantIds: record.participantIds.map(String),
      lastMessageId: record.lastMessageId?.toString() ?? null,
      lastMessageAt: record.lastMessageAt ?? null,
      ...(record.deletedAt !== undefined ? { deletedAt: record.deletedAt } : {}),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toMessageEntity(record: MongoChatMessageRecord): ChatMessageEntity {
    return new ChatMessageEntity({
      id: record._id.toString(),
      conversationId: record.conversationId.toString(),
      senderId: record.senderId.toString(),
      kind: record.kind,
      text: record.text ?? '',
      codeLanguage: record.codeLanguage ?? null,
      attachment: record.attachment
        ? {
            url: record.attachment.url,
            ...(record.attachment.storagePublicId
              ? { storagePublicId: record.attachment.storagePublicId }
              : {}),
            name: record.attachment.name,
            mimeType: record.attachment.mimeType,
            sizeBytes: record.attachment.sizeBytes,
            durationSeconds: record.attachment.durationSeconds ?? null,
          }
        : null,
      sharedTracker: record.sharedTracker
        ? {
            trackerId: record.sharedTracker.trackerId.toString(),
            title: record.sharedTracker.title,
            description: record.sharedTracker.description ?? '',
            visibility: record.sharedTracker.visibility,
          }
        : null,
      forwardedFromMessageId: record.forwardedFromMessageId?.toString() ?? null,
      readBy: (record.readBy ?? []).map(String),
      ...(record.deletedAt !== undefined ? { deletedAt: record.deletedAt } : {}),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toParticipantEntity(record: MongoChatParticipantRecord): ChatParticipantEntity {
    return new ChatParticipantEntity({
      id: record._id.toString(),
      fullName: record.fullName,
      username: record.username,
      ...(record.avatarUrl !== undefined ? { avatarUrl: record.avatarUrl } : {}),
      level: record.level ?? 1,
      lastActiveAt: record.lastActiveAt ?? null,
      presenceVisible: record.presenceVisible ?? true,
    });
  }
}
