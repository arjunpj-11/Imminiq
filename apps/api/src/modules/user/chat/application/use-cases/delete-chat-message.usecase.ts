import type { IChatConversationQueryRepository } from '../../domain/repositories/chat-conversation-query.repository.interface';
import type { IChatMessageCommandRepository } from '../../domain/repositories/chat-message-command.repository.interface';
import type { IChatMessageQueryRepository } from '../../domain/repositories/chat-message-query.repository.interface';
import { ChatApplicationError } from '../chat-application.error';

export interface IDeleteChatMessageUseCase {
  execute(viewerUserId: string, messageId: string): Promise<void>;
}

export class DeleteChatMessageUseCase implements IDeleteChatMessageUseCase {
  constructor(
    private readonly _messages: Pick<IChatMessageQueryRepository, 'findMessagesByIds'>,
    private readonly _conversations: Pick<
      IChatConversationQueryRepository,
      'findConversationForParticipant'
    >,
    private readonly _commands: Pick<IChatMessageCommandRepository, 'deleteMessage'>
  ) {}

  async execute(viewerUserId: string, messageId: string) {
    const message = (await this._messages.findMessagesByIds([messageId]))[0];
    if (
      !message ||
      !(await this._conversations.findConversationForParticipant(
        message.conversationId,
        viewerUserId
      ))
    ) {
      throw ChatApplicationError.messageNotFound();
    }
    if (message.senderId !== viewerUserId) throw ChatApplicationError.messageNotEditable();
    if (!(await this._commands.deleteMessage(messageId, viewerUserId))) {
      throw ChatApplicationError.messageNotFound();
    }
  }
}
