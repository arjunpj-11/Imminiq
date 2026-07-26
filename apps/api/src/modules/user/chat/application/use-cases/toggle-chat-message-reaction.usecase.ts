import type { IChatConversationQueryRepository } from '../../domain/repositories/chat-conversation-query.repository.interface';
import type { IChatMessageCommandRepository } from '../../domain/repositories/chat-message-command.repository.interface';
import type { IChatMessageQueryRepository } from '../../domain/repositories/chat-message-query.repository.interface';
import type { ChatMessageDTO, ToggleChatReactionInputDTO } from '../chat.dto';
import { ChatApplicationError } from '../chat-application.error';
import type { IChatMapper } from '../chat.mapper';

export interface IToggleChatMessageReactionUseCase {
  execute(viewerUserId: string, input: ToggleChatReactionInputDTO): Promise<ChatMessageDTO>;
}

export class ToggleChatMessageReactionUseCase implements IToggleChatMessageReactionUseCase {
  constructor(
    private readonly _messages: Pick<IChatMessageQueryRepository, 'findMessagesByIds'>,
    private readonly _conversations: Pick<
      IChatConversationQueryRepository,
      'findConversationForParticipant'
    >,
    private readonly _commands: Pick<IChatMessageCommandRepository, 'toggleMessageReaction'>,
    private readonly _mapper: IChatMapper
  ) {}

  async execute(viewerUserId: string, input: ToggleChatReactionInputDTO) {
    const message = (await this._messages.findMessagesByIds([input.messageId]))[0];
    if (
      !message ||
      !(await this._conversations.findConversationForParticipant(
        message.conversationId,
        viewerUserId
      ))
    ) {
      throw ChatApplicationError.messageNotFound();
    }
    const updated = await this._commands.toggleMessageReaction(
      input.messageId,
      viewerUserId,
      input.emoji
    );
    if (!updated) throw ChatApplicationError.messageNotFound();
    return this._mapper.toMessageView(updated, viewerUserId);
  }
}
