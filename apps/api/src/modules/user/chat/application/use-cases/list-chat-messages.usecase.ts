import type { IChatConversationQueryRepository } from '../../domain/repositories/chat-conversation-query.repository.interface';
import type { IChatMessageQueryRepository } from '../../domain/repositories/chat-message-query.repository.interface';
import type { ChatMessageDTO, ChatPageDTO, ListChatInputDTO } from '../chat.dto';
import { ChatApplicationError } from '../chat-application.error';
import type { IChatMapper } from '../chat.mapper';

export interface IListChatMessagesUseCase {
  execute(
    viewerUserId: string,
    conversationId: string,
    payload: ListChatInputDTO
  ): Promise<ChatPageDTO<ChatMessageDTO>>;
}

export class ListChatMessagesUseCase implements IListChatMessagesUseCase {
  constructor(
    private readonly _conversationQueryRepository: IChatConversationQueryRepository,
    private readonly _messageQueryRepository: IChatMessageQueryRepository,
    private readonly _chatMapper: IChatMapper
  ) {}

  async execute(viewerUserId: string, conversationId: string, payload: ListChatInputDTO) {
    const conversation =
      await this._conversationQueryRepository.findConversationForParticipant(
        conversationId,
        viewerUserId
      );
    if (!conversation) throw ChatApplicationError.conversationNotFound();
    const page = await this._messageQueryRepository.listMessages({
      conversationId,
      page: payload.page,
      limit: payload.limit,
    });
    return this._chatMapper.toMessagePageView(page, viewerUserId);
  }
}
