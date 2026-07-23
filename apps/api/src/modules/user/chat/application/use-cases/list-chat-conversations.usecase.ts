import { ChatConversationSummaryEntity } from '../../domain/entities/chat-conversation-summary.entity';
import type { IChatConversationQueryRepository } from '../../domain/repositories/chat-conversation-query.repository.interface';
import type { IChatMessageQueryRepository } from '../../domain/repositories/chat-message-query.repository.interface';
import type { IChatParticipantRepository } from '../../domain/repositories/chat-participant.repository.interface';
import type { IChatBlockRepository } from '../../domain/repositories/chat-block.repository.interface';
import type { ChatConversationDTO, ChatPageDTO, ListChatInputDTO } from '../chat.dto';
import { ChatApplicationError } from '../chat-application.error';
import type { IChatMapper } from '../chat.mapper';

export interface IListChatConversationsUseCase {
  execute(
    viewerUserId: string,
    payload: ListChatInputDTO
  ): Promise<ChatPageDTO<ChatConversationDTO>>;
}

export class ListChatConversationsUseCase implements IListChatConversationsUseCase {
  constructor(
    private readonly _conversationQueryRepository: IChatConversationQueryRepository,
    private readonly _messageQueryRepository: IChatMessageQueryRepository,
    private readonly _participantRepository: IChatParticipantRepository,
    private readonly _blockRepository: Pick<
      IChatBlockRepository,
      'listBlockedByUserIds'
    >,
    private readonly _chatMapper: IChatMapper
  ) {}

  async execute(viewerUserId: string, payload: ListChatInputDTO) {
    const page = await this._conversationQueryRepository.listConversations({
      viewerUserId,
      page: payload.page,
      limit: payload.limit,
    });
    const participantIds = page.items
      .map((conversation) => conversation.otherParticipantId(viewerUserId))
      .filter((id): id is string => Boolean(id));
    const lastMessageIds = page.items
      .map((conversation) => conversation.lastMessageId)
      .filter((id): id is string => Boolean(id));
    const [participants, messages, unreadCounts, blockedByUserIds] = await Promise.all([
      this._participantRepository.findParticipants(participantIds),
      this._messageQueryRepository.findMessagesByIds(lastMessageIds),
      this._messageQueryRepository.findUnreadCounts(
        page.items.map((conversation) => conversation.id),
        viewerUserId
      ),
      this._blockRepository.listBlockedByUserIds(viewerUserId),
    ]);
    const messageMap = new Map(messages.map((message) => [message.id, message]));
    const summaries = page.items.map((conversation) => {
      const participantId = conversation.otherParticipantId(viewerUserId);
      const participant = participantId ? participants.get(participantId) : undefined;
      if (!participant) throw ChatApplicationError.participantNotFound();
      return new ChatConversationSummaryEntity({
        conversation,
        participant,
        lastMessage: conversation.lastMessageId
          ? messageMap.get(conversation.lastMessageId) ?? null
          : null,
        unreadCount: unreadCounts.get(conversation.id) ?? 0,
      });
    });

    return this._chatMapper.toConversationPageView(
      { ...page, items: summaries },
      viewerUserId,
      new Set(blockedByUserIds)
    );
  }
}
