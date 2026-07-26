import type { IChatMessageQueryRepository } from '../../domain/repositories/chat-message-query.repository.interface';
import type { ChatMessageDTO, ChatPageDTO, ListChatInputDTO } from '../chat.dto';
import type { IChatMapper } from '../chat.mapper';

export interface IListSavedChatMessagesUseCase {
  execute(viewerUserId: string, query: ListChatInputDTO): Promise<ChatPageDTO<ChatMessageDTO>>;
}

export class ListSavedChatMessagesUseCase implements IListSavedChatMessagesUseCase {
  constructor(
    private readonly _messages: Pick<IChatMessageQueryRepository, 'listStarredMessages'>,
    private readonly _mapper: IChatMapper
  ) {}

  async execute(viewerUserId: string, query: ListChatInputDTO) {
    const page = await this._messages.listStarredMessages(viewerUserId, query.page, query.limit);
    return this._mapper.toMessagePageView(page, viewerUserId);
  }
}
