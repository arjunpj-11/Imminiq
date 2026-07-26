import type {
  ChatConversationDTO,
  ChatMessageDTO,
  ChatParticipantDTO,
  ChatPageDTO,
} from './chat.dto';
import type { ChatConversationSummaryEntity } from '../domain/entities/chat-conversation-summary.entity';
import type { ChatMessageEntity } from '../domain/entities/chat-message.entity';
import type { ChatParticipantEntity } from '../domain/entities/chat-participant.entity';
import type { PaginatedChatResult } from '../domain/chat.types';
import type { IChatPresenceProvider } from '../domain/services/chat-presence-provider.interface';

export interface IChatMapper {
  toMessageView(message: ChatMessageEntity, viewerUserId: string): ChatMessageDTO;
  toParticipantView(
    participant: ChatParticipantEntity,
    hidePrivateDetails?: boolean
  ): ChatParticipantDTO;
  toConversationView(
    summary: ChatConversationSummaryEntity,
    viewerUserId: string,
    participantBlockedViewer?: boolean
  ): ChatConversationDTO;
  toConversationPageView(
    page: PaginatedChatResult<ChatConversationSummaryEntity>,
    viewerUserId: string,
    blockedByUserIds?: ReadonlySet<string>
  ): ChatPageDTO<ChatConversationDTO>;
  toMessagePageView(
    page: PaginatedChatResult<ChatMessageEntity>,
    viewerUserId: string
  ): ChatPageDTO<ChatMessageDTO>;
}

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'IM';

export class ChatMapper implements IChatMapper {
  constructor(private readonly _presenceProvider: IChatPresenceProvider) {}

  toMessageView(message: ChatMessageEntity, viewerUserId: string): ChatMessageDTO {
    return {
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
            durationSeconds: message.attachment.durationSeconds ?? null,
          }
        : null,
      sharedTracker: message.sharedTracker,
      sharedProfile: message.sharedProfile,
      isForwarded: Boolean(message.forwardedFromMessageId),
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      isRead:
        message.senderId !== viewerUserId || message.isReadByAnotherParticipant(),
      isStarred: message.isStarredBy(viewerUserId),
    };
  }

  toParticipantView(
    participant: ChatParticipantEntity,
    hidePrivateDetails = false
  ): ChatParticipantDTO {
    return {
      id: participant.id,
      fullName: participant.fullName,
      username: participant.username,
      handle: `@${participant.username}`,
      initials: getInitials(participant.fullName || participant.username),
      avatarUrl: hidePrivateDetails ? null : participant.avatarUrl ?? null,
      level: participant.level,
      isOnline:
        !hidePrivateDetails &&
        participant.presenceVisible &&
        this._presenceProvider.isOnline(participant.id),
      lastActiveAt:
        !hidePrivateDetails && participant.presenceVisible
          ? participant.lastActiveAt
          : null,
      presenceVisible: hidePrivateDetails ? false : participant.presenceVisible,
    };
  }

  toConversationView(
    summary: ChatConversationSummaryEntity,
    viewerUserId: string,
    participantBlockedViewer = false
  ): ChatConversationDTO {
    return {
      id: summary.conversation.id,
      participant: this.toParticipantView(
        summary.participant,
        participantBlockedViewer
      ),
      lastMessage: summary.lastMessage
        ? this.toMessageView(summary.lastMessage, viewerUserId)
        : null,
      lastMessageAt: summary.lastMessage?.createdAt ?? null,
      unreadCount: summary.unreadCount,
    };
  }

  toConversationPageView(
    page: PaginatedChatResult<ChatConversationSummaryEntity>,
    viewerUserId: string,
    blockedByUserIds: ReadonlySet<string> = new Set()
  ): ChatPageDTO<ChatConversationDTO> {
    return {
      items: page.items.map((summary) =>
        this.toConversationView(
          summary,
          viewerUserId,
          blockedByUserIds.has(summary.participant.id)
        )
      ),
      pagination: this.toPaginationView(page),
    };
  }

  toMessagePageView(
    page: PaginatedChatResult<ChatMessageEntity>,
    viewerUserId: string
  ): ChatPageDTO<ChatMessageDTO> {
    return {
      items: page.items.map((message) => this.toMessageView(message, viewerUserId)),
      pagination: this.toPaginationView(page),
    };
  }

  private toPaginationView<T>(page: PaginatedChatResult<T>) {
    return {
      page: page.page,
      limit: page.limit,
      total: page.total,
      hasMore: page.hasMore,
    };
  }
}
