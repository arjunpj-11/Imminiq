import type { IChatConversationQueryRepository } from '../../domain/repositories/chat-conversation-query.repository.interface';
import type { IChatMessageCommandRepository } from '../../domain/repositories/chat-message-command.repository.interface';
import type { IChatMessageQueryRepository } from '../../domain/repositories/chat-message-query.repository.interface';
import type { ChatMessageDTO, EditChatMessageInputDTO } from '../chat.dto';
import { ChatApplicationError } from '../chat-application.error';
import type { IChatMapper } from '../chat.mapper';

export interface IEditChatMessageUseCase {
  execute(viewerUserId: string, input: EditChatMessageInputDTO): Promise<ChatMessageDTO>;
}

export class EditChatMessageUseCase implements IEditChatMessageUseCase {
  constructor(
    private readonly _messages: Pick<IChatMessageQueryRepository, 'findMessagesByIds'>,
    private readonly _conversations: Pick<
      IChatConversationQueryRepository,
      'findConversationForParticipant'
    >,
    private readonly _commands: Pick<IChatMessageCommandRepository, 'editMessageText'>,
    private readonly _mapper: IChatMapper
  ) {}

  async execute(viewerUserId: string, input: EditChatMessageInputDTO) {
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
    if (message.senderId !== viewerUserId) throw ChatApplicationError.messageNotEditable();
    const updated = await this._commands.editMessageText(
      input.messageId,
      viewerUserId,
      input.text.trim()
    );
    if (!updated) throw ChatApplicationError.messageNotEditable();
    return this._mapper.toMessageView(updated, viewerUserId);
  }
}
