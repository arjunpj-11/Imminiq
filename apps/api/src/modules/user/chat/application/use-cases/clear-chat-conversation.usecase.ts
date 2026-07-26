import type { IChatConversationQueryRepository } from '../../domain/repositories/chat-conversation-query.repository.interface';
import type { IChatMessageCommandRepository } from '../../domain/repositories/chat-message-command.repository.interface';
import type { ClearChatConversationViewDTO } from '../chat.dto';
import { ChatApplicationError } from '../chat-application.error';

export interface IClearChatConversationUseCase {
  execute(viewerUserId: string, conversationId: string): Promise<ClearChatConversationViewDTO>;
}

export class ClearChatConversationUseCase implements IClearChatConversationUseCase {
  constructor(
    private readonly _conversations: Pick<
      IChatConversationQueryRepository,
      'findConversationForParticipant'
    >,
    private readonly _messages: Pick<IChatMessageCommandRepository, 'clearConversationMessages'>
  ) {}

  async execute(viewerUserId: string, conversationId: string) {
    const conversation = await this._conversations.findConversationForParticipant(
      conversationId,
      viewerUserId
    );
    if (!conversation) throw ChatApplicationError.conversationNotFound();
    const clearedCount = await this._messages.clearConversationMessages(
      conversationId,
      viewerUserId
    );
    return {
      conversationId,
      clearedCount,
      preservedStarredMessages: true,
    };
  }
}
