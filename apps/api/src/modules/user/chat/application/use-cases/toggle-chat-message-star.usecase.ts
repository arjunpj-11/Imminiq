import type { IChatConversationQueryRepository } from '../../domain/repositories/chat-conversation-query.repository.interface';
import type { IChatMessageCommandRepository } from '../../domain/repositories/chat-message-command.repository.interface';
import type { IChatMessageQueryRepository } from '../../domain/repositories/chat-message-query.repository.interface';
import type { ChatMessageDTO } from '../chat.dto';
import { ChatApplicationError } from '../chat-application.error';
import type { IChatMapper } from '../chat.mapper';

export interface IToggleChatMessageStarUseCase {
  execute(viewerUserId: string, messageId: string): Promise<ChatMessageDTO>;
}

export class ToggleChatMessageStarUseCase implements IToggleChatMessageStarUseCase {
  constructor(
    private readonly _conversations: Pick<
      IChatConversationQueryRepository,
      'findConversationForParticipant'
    >,
    private readonly _messageQueries: Pick<IChatMessageQueryRepository, 'findMessagesByIds'>,
    private readonly _messageCommands: Pick<IChatMessageCommandRepository, 'toggleMessageStar'>,
    private readonly _mapper: IChatMapper
  ) {}

  async execute(viewerUserId: string, messageId: string) {
    const [message] = await this._messageQueries.findMessagesByIds([messageId]);
    if (!message) throw ChatApplicationError.messageNotFound();
    const conversation = await this._conversations.findConversationForParticipant(
      message.conversationId,
      viewerUserId
    );
    if (!conversation) throw ChatApplicationError.conversationNotFound();
    const updated = await this._messageCommands.toggleMessageStar(messageId, viewerUserId);
    if (!updated) throw ChatApplicationError.messageNotFound();
    return this._mapper.toMessageView(updated, viewerUserId);
  }
}
